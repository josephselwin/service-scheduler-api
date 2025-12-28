#!/bin/bash

# Configuration
# UNIQUE_APP_NAME must be globally unique in Azure. 
# Changing this to something random to avoid conflicts.
# RANDOM_ID=$((RANDOM % 9000 + 1000))
APP_NAME="service-scheduler-api-7132"
RG_NAME="rg-service-scheduler-qa"
PLAN_NAME="ServiceSchedulerPlan"
LOCATION="eastus"
RUNTIME="NODE|14-lts" # Changed from : to | and downgraded to 14 due to CLI limits
SKU="F1" # Free Tier

# Load Environment Variables from .env
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo ".env file not found!"
    exit 1
fi

echo "Starting deployment for $APP_NAME..."

# Pre-deployment: Configure SQL Firewall
SERVER_NAME=$(echo $DB_SERVER | cut -d'.' -f1)
echo "Looking for Resource Group of SQL Server: $SERVER_NAME..."
SERVER_RG=$(az sql server list --query "[?name=='$SERVER_NAME'].resourceGroup" -o tsv)

if [ -n "$SERVER_RG" ]; then
    echo "Found SQL Server in RG: $SERVER_RG. Configuring Firewall..."
    az sql server firewall-rule create --resource-group $SERVER_RG --server $SERVER_NAME --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0 || echo "Firewall rule might already exist."
else
    echo "Could not find SQL Server '$SERVER_NAME' in this subscription. Skipping firewall configuration (manual step might be needed)."
fi

# 1. Create Resource Group
echo "Creating Resource Group: $RG_NAME..."
az group create --name $RG_NAME --location $LOCATION

# 2. Create App Service Plan
echo "Creating App Service Plan ($SKU)..."
az appservice plan create --name $PLAN_NAME --resource-group $RG_NAME --sku $SKU --is-linux

# 3. Create Web App
echo "Creating Web App: $APP_NAME..."
az webapp create --resource-group $RG_NAME --plan $PLAN_NAME --name $APP_NAME --runtime "$RUNTIME"

# 4. Configure App Settings (Database Connection)
echo "Configuring App Settings..."
az webapp config appsettings set --resource-group $RG_NAME --name $APP_NAME --settings \
    DB_SERVER="$DB_SERVER" \
    DB_DATABASE="$DB_DATABASE" \
    DB_USER="$DB_USER" \
    DB_PASSWORD="$DB_PASSWORD" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true

# 5. Deploy Code
echo "Deploying code..."
az webapp up --name $APP_NAME --resource-group $RG_NAME --plan $PLAN_NAME

echo "Deployment Completed!"
echo "Your API is available at: https://$APP_NAME.azurewebsites.net"
