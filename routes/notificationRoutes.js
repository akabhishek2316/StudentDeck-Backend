const express = require("express");

const protect = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

const router = express.Router();

/*
 * GET CURRENT USER NOTIFICATIONS
 */
router.get("/", protect, async (req, res) => {
    try {
        const notifications =
            await Notification.find({
                recipient: req.user._id
            })
                .populate(
                    "actor",
                    "name profileImage"
                )
                .sort({
                    createdAt: -1
                })
                .limit(50);

        const unreadCount =
            await Notification.countDocuments({
                recipient: req.user._id,
                read: false
            });

        return res.status(200).json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error(
            "Get notifications error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching notifications"
        });
    }
});

/*
 * MARK ONE NOTIFICATION AS READ
 */
/*
 * CLEAR ALL NOTIFICATIONS FOR CURRENT USER
 */
router.delete(
    "/read-all",
    protect,
    async (req, res) => {
        try {
            const result =
                await Notification.deleteMany({
                    recipient: req.user._id
                });

            return res.status(200).json({
                message:
                    "All notifications cleared",
                deletedCount:
                    result.deletedCount,
                unreadCount: 0
            });
        } catch (error) {
            console.error(
                "Clear all notifications error:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Server error while clearing notifications"
            });
        }
    }
);

/*
 * MARK ALL NOTIFICATIONS AS READ
 */
router.put(
    "/read-all",
    protect,
    async (req, res) => {
        try {
            await Notification.updateMany(
                {
                    recipient: req.user._id,
                    read: false
                },
                {
                    read: true
                }
            );

            return res.status(200).json({
                message:
                    "All notifications marked as read"
            });
        } catch (error) {
            console.error(
                "Mark all notifications read error:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Server error while updating notifications"
            });
        }
    }
);

module.exports = router;