import User from "../models/user.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import moment from "moment"

export const getCurrentUser = async (req, res) => {
    try {
        // console.log(req.body)
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
    }
    return res.status(400).json({ message: "get current user error" })
}

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body
        let assistantImage

        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path)
        }
        else {
            assistantImage = imageUrl;
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            assistantName, assistantImage
        }, { new: true }).select("-password")
        return res.status(200).json(user)
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            message: "update assistant error",
            error: error.message
        });
    }
}

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;
        const user = await User.findById(req.userId);
        user.history.push(command);
        user.save()
        const userName = user.name;
        const assistantName = user.assistantName;

        const text = command.toLowerCase().trim();

        const timeRegex = /\b(what(?:'s|s| is)?\s+(?:the\s+)?time\b|current\s+time\b|time\s+(?:is\s+it|right\s+now)\b|tell\s+me\s+the\s+time\b)/;
        const dateRegex = /\b(what(?:'s|s| is)?\s+(?:the\s+)?date\b|current\s+date\b|today'?s?\s+date\b|date\s+today\b|tell\s+me\s+the\s+date\b)/;
        const dayRegex = /\b(what(?:'s|s| is)?\s+(?:the\s+)?day\s+(?:is\s+)?(?:it|today)\b|which\s+day\s+(?:is\s+)?(?:it|today)\b|today'?s?\s+day\b|current\s+day\b|tell\s+me\s+the\s+day\b)/;
        const monthRegex = /\b(what(?:'s|s| is)?\s+(?:the\s+)?month\b|current\s+month\b|which\s+month\b|tell\s+me\s+the\s+month\b)/;

        let type = null;
        if (timeRegex.test(text)) type = "get_time";
        else if (dateRegex.test(text)) type = "get_date";
        else if (dayRegex.test(text)) type = "get_day";
        else if (monthRegex.test(text)) type = "get_month";

        if (type) {
            switch (type) {
                case 'get_date':
                    return res.json({
                        type,
                        userInput: command,
                        response: `Current Date is ${moment().format("DD-MM-YYYY")}`
                    });

                case 'get_time':
                    return res.json({
                        type,
                        userInput: command,
                        response: `Current Time is ${moment().format("hh:mm A")}`
                    });

                case 'get_day':
                    return res.json({
                        type,
                        userInput: command,
                        response: `Today is ${moment().format("dddd")}`
                    });

                case 'get_month':
                    return res.json({
                        type,
                        userInput: command,
                        response: `The Month is ${moment().format("MMMM")}`
                    });
            }
        }

        const result = await geminiResponse(command, assistantName, userName);

        if (!result) {
            return res.json({
                type: "general",
                userInput: command,
                response: "Sorry, I am facing issues connecting to the internet at the moment. Please try again in a while."
            });
        }

        const jsonMatch = result.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            return res.json({
                type: "general",
                userInput: command,
                response: "Sorry, I am facing issues connecting to the internet at the moment. Please try again in a while."
            });
        }
        const gemResult = JSON.parse(jsonMatch[0]);

        type = gemResult.type;

        switch (type) {
            case 'get_date':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current Date is ${moment().format("DD-MM-YYYY")}`
                });

            case 'get_time':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current Time is ${moment().format("hh:mm A")}`
                });

            case 'get_day':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today is ${moment().format("dddd")}`
                });

            case 'get_month':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `The Month is ${moment().format("MMMM")}`
                });

            case 'google_search':
            case 'youtube_search':
            case 'youtube_play':
            case 'general':
            case "calculator_open":
            case "instagram_open":
            case "facebook_open":
            case "weather_show":
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response,
                });

            default:
                return res.status(400).json({ response: "Sorry, I Didnt Understand That Command.!" })
        }
    }
    catch (error) {
        console.log("ASK ASSISTANT ERROR:", error);
        return res.json({
            type: "general",
            userInput: req.body.command,
            response: "Sorry, I am facing issues connecting to the internet at the moment. Please try again in a while."
        });
    }
}