CLIENT_TARGET_DIR=html/public

# create production build of client app
cd ui || exit
npm i
npm run build

# copy client app
cd .. || exit

rm -r ${CLIENT_TARGET_DIR:?}/*
touch ${CLIENT_TARGET_DIR}/.gitkeep
cp -r ui/build/* ${CLIENT_TARGET_DIR}/
