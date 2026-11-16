import {defineConfig} from '@playwright/test';
const live=process.env.GAME_BASE_URL;
export default defineConfig({
 testDir:'./game/preview-2d/browser',timeout:45000,expect:{timeout:15000},
 workers:1,retries:0,reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:live||'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'desktop',use:{viewport:{width:1440,height:900}}},
  {name:'iphone-size',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
  {name:'android-size',use:{viewport:{width:360,height:800},isMobile:true,hasTouch:true}}
 ],
 webServer:live?undefined:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}
});
