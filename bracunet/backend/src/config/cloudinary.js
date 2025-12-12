import { v2 as cloudinary } from "cloudinary";
import { config } from "./index.js";

cloudinary.config({
  cloud_name: "dg0xhxxla",
  api_key: "917816188474383",
  api_secret: "hK3S3BSxqK1d4x6kcLc4jXG89EM",
});

export default cloudinary;
