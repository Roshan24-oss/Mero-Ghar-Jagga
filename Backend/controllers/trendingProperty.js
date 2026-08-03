import Property from "../models/Property.js";

export const getTrendingProperties = async (req, res) => {

    const { type } = req.params;

    try {

        let query = {
            isTrending: true,
        };

        if (type !== "all") {
            query.propertyType = type;
        }

        const properties = await Property.find(query)
            .sort({ trendingScore: -1 })
            .populate("owner", "_id fullName phone");

        res.json(properties);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};