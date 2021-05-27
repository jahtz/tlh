CLIENT_TARGET_DIR=html/public

SSH_PORT=4222
SSH_USER=www-data
SSH_HOST=localhost

WEB_ROOT_DIR=/var/www

TAR_FILE_NAME=tlh

# create production build of client app
cd ui || exit
npm i
npm run build

# copy client app
cd .. || exit

rm -r ${CLIENT_TARGET_DIR:?}/*
touch ${CLIENT_TARGET_DIR}/.gitkeep
cp -r ui/build/* ${CLIENT_TARGET_DIR}/

# package files
FILES_TO_UPLOAD=(html composer.json composer.lock mysqliconn.php)

mkdir -p ${TAR_FILE_NAME}
cp -r "${FILES_TO_UPLOAD[@]}" ${TAR_FILE_NAME}
tar -czvf ${TAR_FILE_NAME}.tar.gz ${TAR_FILE_NAME}
rm -rf ${TAR_FILE_NAME}

scp -r -P ${SSH_PORT} ${TAR_FILE_NAME}.tar.gz ${SSH_USER}@${SSH_HOST}:${WEB_ROOT_DIR}
rm ${TAR_FILE_NAME}.tar.gz

# deploy files
ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} <<"EOF"
cd ${WEB_ROOT_DIR}

rm -r "${FILES_TO_UPLOAD[@]}"

tar -xzvf ${TAR_FILE_NAME}
rm ${TAR_FILE_NAME}

composer install

EOF
