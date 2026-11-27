# Deploying Binary Boppers

The repository includes a Render Blueprint in `render.yaml`. It builds the React site and serves it from the Express app, so the frontend and API share one HTTPS origin.

## First deployment

1. Create or sign in to a Render account, connect GitHub, and create a new Blueprint using `ss-vidit/Society-Website` on the `main` branch.
2. Review the Blueprint before creating resources. The service uses Render's free plan; see the limitations below.
3. Set `MONGODB_URI` in the Render service environment to the production MongoDB connection string. Do not commit it or paste it into a chat.
4. In MongoDB Atlas, allow the Render service's outbound IP ranges in Network Access. Avoid allowing every IP unless you understand and accept that exposure.
5. Deploy the Blueprint. Render supplies `RENDER_EXTERNAL_URL`; the backend uses it for the allowed browser origin. A custom domain requires setting `CLIENT_URL` to that domain in the service environment.

Render generates `JWT_SECRET` for the service. Existing accounts remain in MongoDB; active browser sessions may need to sign in again after the first deployment.

For a manually configured Web Service, use this build command so frontend build dependencies such as Vite are installed even when `NODE_ENV=production`:

```sh
npm ci --prefix backend && npm ci --include=dev --prefix frontend && npm run build --prefix frontend
```

## Image uploads

Cloudinary is optional. Without Cloudinary credentials, uploads are limited to 1 MB per image and stored as data URLs in MongoDB. To use Cloudinary, set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in Render's service environment.

## Free plan notes

Render's free web service can sleep after 15 minutes without traffic, so the first visit afterward can take about a minute to wake. Free instances are intended for previews and hobby use, and Render may suspend a free service for unusually high outbound traffic to external services such as MongoDB. Consider a paid plan before relying on the site for regular society operations.
