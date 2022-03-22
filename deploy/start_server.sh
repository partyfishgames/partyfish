echo "Launching Server"
cd /home/server/partyfish/server
export PORT=8000
pm2 start npm --name "server" -- start

cd /home/server/sandbox
pm2 start serve_file.js --name "help"