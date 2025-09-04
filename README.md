# Imperial Pet Studio

## Project info

**Description**: Site para banho e tosa, produtos para pets
**Website**: https://imperialpets.com.br

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

You can deploy this project using various hosting platforms such as Vercel, Netlify, or GitHub Pages.

## Domain Information

This project is configured to use the custom domain: **imperialpets.com.br**

### Railway Deployment Instructions

To deploy this project on Railway with the custom domain:

1. **Link your repository to Railway**:
   - Create a new project in Railway
   - Connect your GitHub repository
   - Railway will automatically detect and use the configuration from `railway.json`

2. **Configure DNS settings**:
   - Go to your domain registrar (e.g., GoDaddy, Namecheap)
   - Add the following DNS records:
     ```
     A     imperialpets.com.br     76.76.21.21
     CNAME www.imperialpets.com.br railway.app
     ```

3. **Verify your domain on Railway**:
   - In your Railway project, go to Settings > Domains
   - Click "Add Domain" and enter `imperialpets.com.br`
   - Railway will verify your DNS settings
   - Add a second domain for `www.imperialpets.com.br` if needed

4. **SSL Certificate**:
   - Railway will automatically provision an SSL certificate via Let's Encrypt
   - This enables secure HTTPS access to your site

Your site will be accessible at https://imperialpets.com.br once the DNS propagation is complete (may take up to 24-48 hours).
