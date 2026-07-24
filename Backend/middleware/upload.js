import  multer from 'multer';
 const storage = multer.memoryStorage();


 const filter = (req,file,cb)=>{

    const allowed =[

         "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",

        "video/mp4",
        "video/webm",
        "video/quicktime"
    ];

    if(allowed.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error("invalid file type"),false);
    }

 };

 const upload = multer({
    storage,
    limits:{
        fileSize:30*1024*1024
    },
    fileFilter
 })

 export default upload;