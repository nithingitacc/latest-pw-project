# -------------------------------------------------------
# Base image: Official Playwright (includes browsers)
# -------------------------------------------------------
FROM mcr.microsoft.com/playwright:v1.42.0-jammy

# -------------------------------------------------------
# Set working directory inside container
# -------------------------------------------------------
WORKDIR /app

# -------------------------------------------------------
# Copy package files first (better Docker caching)
# -------------------------------------------------------
COPY package.json package-lock.json* ./

# -------------------------------------------------------
# Install Node dependencies
# -------------------------------------------------------
RUN npm ci

# -------------------------------------------------------
# Copy the rest of the project files
# -------------------------------------------------------
COPY . .

# -------------------------------------------------------
# Create folders for reports (mounted by Jenkins)
# -------------------------------------------------------
RUN mkdir -p playwright-report test-results

# -------------------------------------------------------
# Run Playwright tests
# IMPORTANT:
# - HTML report goes to /app/playwright-report
# - JUnit XML goes to /app/test-results
# -------------------------------------------------------
CMD ["npx", "playwright", "test"]
