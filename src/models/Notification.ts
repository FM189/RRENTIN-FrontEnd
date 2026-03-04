import mongoose, { Schema, Document, Model } from "mongoose";
import { NotificationType } from "@/types/notifications";

export { NotificationType };

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    href:    { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    data:    { type: Schema.Types.Mixed, default: undefined },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 150 });

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
