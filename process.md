# 🚀 Complete Guide: Deploying a React App with Nginx on Linux

## 📋 Prerequisites
- Ubuntu/Debian-based Linux system
- Sudo access
- Internet connection

---

## 🔧 Step-by-Step Deployment Guide

### 📦 Step 1: Update Package Index
```bash
sudo apt update
```
Updates the package index so your system knows about the latest available software versions.

---

### 🧹 Step 2: Clear Terminal
```bash
clear
```
Clears the terminal screen for readability.

---

### ⚙️ Step 3: Install Node.js
```bash
sudo apt install nodejs -y
```
*Alternative:*
```bash
sudo apt install node -y
```
Installs Node.js, required for building and running React apps.

---

### 📦 Step 4: Install npm and Nginx
```bash
sudo apt install npm nginx -y
```
Installs:
- **npm**: Node Package Manager to install project dependencies
- **Nginx**: A high-performance web server to serve your React app

---

### ✅ Step 5: Verify Installations
```bash
node -v
npm -v
nginx -v
```
Displays installed versions of Node.js, npm, and Nginx.

---

### 🔍 Step 6: Check Nginx Service
```bash
sudo systemctl status nginx
```
Verifies whether Nginx is running.

If inactive, start it using:
```bash
sudo systemctl start nginx
```

---

### 💾 Step 7: Install Git
```bash
sudo apt install git -y
```
Installs Git to clone repositories from GitHub.

---

### 🧩 Step 8: Verify Git Installation
```bash
git -v
```
Checks Git installation.

---

### 📁 Step 9: Clone React Project
```bash
git clone https://github.com/Course5-Intelligence-Limited/Demo_brand_themes_3D.git
```
Clones the project repository from GitHub.

---

### 📂 Step 10: Navigate to Project Directory
```bash
cd Demo_brand_themes_3D/
ls
```
Moves into the cloned project folder and lists its contents.

---

### 📥 Step 11: Install Project Dependencies
```bash
npm install
```
Installs all required packages listed in `package.json`.

---

### 🔧 Step 12: Install Additional Libraries
```bash
npm install 3d-force-graph react-force-graph
```
Installs the required 3D visualization libraries.

---

### 🏗️ Step 13: Build the React App
```bash
npm run build
```
Builds an optimized production version of your React app inside the `/build` directory.

---

### 🗂️ Step 14: Create Deployment Directory
```bash
sudo mkdir -p /var/www/reactapp
```
Creates a new directory for hosting the built React files.

---

### 📤 Step 15: Copy Build Files
```bash
sudo cp -r build/* /var/www/reactapp/
```
Copies the production build files to Nginx's web root.

---

### 🧱 Step 16: Remove Default Nginx Configuration
```bash
sudo rm /etc/nginx/sites-enabled/default
```
Removes the default site configuration to make room for your React app.

---

### 📝 Step 17: Create New Nginx Configuration File
```bash
sudo vi /etc/nginx/sites-available/reactapp
```

Add the following content:
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/reactapp;
    index index.html index.htm;
    location / {
        try_files $uri /index.html;
    }
}
```

**Explanation:**
- `root`: Points to the directory containing your React app
- `try_files`: Ensures React routing works properly for single-page apps

---

### 🔗 Step 18: Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/reactapp /etc/nginx/sites-enabled/
```
Creates a symbolic link to enable the new Nginx configuration.

---

### 🧪 Step 19: Test Nginx Configuration
```bash
sudo nginx -t
```
Tests the configuration for syntax errors.

**Expected output:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### 🔄 Step 20: Restart Nginx
```bash
sudo systemctl restart nginx
```
Applies the new configuration and restarts Nginx.

---

### 🟢 Step 21: Verify Nginx Status
```bash
sudo systemctl status nginx
```
Ensures Nginx is running successfully.

---

### 🌐 Step 22: Access Your React App
Open your browser and go to:
```
http://<your-server-ip>
```
You should see your deployed React application! 🎉

---

## 🧾 Quick Reference Summary

| Step | Action | Purpose |
|------|--------|---------|
| 1-3 | Install dependencies | Node.js, npm, Git, Nginx |
| 4-10 | Clone and set up project | Download and prepare React app |
| 11-13 | Build React app | Create production-ready files |
| 14-19 | Configure Nginx | Serve React app through web server |
| 20-21 | Start deployment | Verify and run Nginx |
| 22 | Access app | View deployed application |

---

## 🔧 Troubleshooting Tips

### Nginx won't start
```bash
sudo systemctl status nginx
# Check for port conflicts
sudo netstat -tulpn | grep :80
```

### Build fails
```bash
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### App shows 404 errors
- Verify the `try_files` directive in Nginx configuration
- Check that files are copied correctly to `/var/www/reactapp/`

---

## 📚 Additional Resources
- [Nginx Documentation](https://nginx.org/en/docs/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [npm Documentation](https://docs.npmjs.com/)

---

**Created:** November 2025  
**Version:** 1.0
