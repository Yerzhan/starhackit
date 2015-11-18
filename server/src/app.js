import Promise from 'bluebird';
import Log from 'logfilename';
import config from 'config';
import Plugins from './plugins';
import data from './models';
import Server from './server';
import * as HttpUtils from './utils/HttpUtils';

let log = new Log(__filename, config.log);

displayInfoEnv();

export default class App {
  constructor(){
    this.utils = {
      http: HttpUtils
    };

    this.data = data;
    this.server = new Server(this);
    this.plugins = new Plugins(this);

    displayRoutes(this.server.baseRouter());

    this.data.associate();

    this.parts = [
      this.data,
      this.server,
      this.plugins
    ];
  }

  async seed(){
    log.info("seed");
    await this.data.seed(this);
  }

  async start() {
    log.info("start");
    await Promise.each(this.parts, part => part.start(this));
    log.info("started");
  };

  async stop() {
    log.info("stop");
    await Promise.each(this.parts, part => part.stop(this));
    log.info("stopped");
  };
}

function displayRoutes(router){
  router.stack.forEach(function(middleware){
    if(middleware.name === 'router'){
      log.info(middleware.pathOriginal);
      middleware.handle.stack.forEach(function(handler){
        let route = handler.route;
        route.stack.forEach(function(r){
            var method = r.method.toUpperCase();
            log.info(method ,route.path);
        });
      });
    }
  });
}

function displayInfoEnv(){
  log.info("NODE_ENV: %s", process.env.NODE_ENV);
  if(process.env.NODE_CONFIG){
    log.info("NODE_CONFIG is set");
  }
  log.info("USER: %s", process.env.USER);
  log.info("PWD: %s", process.env.PWD);
}
