const {chromium}=require('playwright');
const fs=require('fs');
exports.launch=async()=>{
 const custom=process.env.AMULSAR_CHROMIUM_PATH;
 const local='/tmp/amulsar-chrome/chromium';
 const options={headless:true,args:['--no-sandbox','--disable-dev-shm-usage']};
 if(custom)options.executablePath=custom;
 else if(fs.existsSync(local)){
  options.executablePath=local;
  options.args.push('--no-zygote','--single-process','--disable-gpu');
 }
 return chromium.launch(options);
};
