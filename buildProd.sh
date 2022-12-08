CLIENT_TARGET_DIR=html/public

# create production build of client app
cd ui || exit
npm i
npm run build

# copy client app
cd .. || exit

mkdir -p ${CLIENT_TARGET_DIR}

rm -r ${CLIENT_TARGET_DIR:?}/*

cp -r ui/build/* ${CLIENT_TARGET_DIR}/

# create .htaccess file
echo "FallbackResource index.html" > ${CLIENT_TARGET_DIR}/.htaccess
