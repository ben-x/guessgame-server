'use strict';

import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import appConfig from '../configs/app';
import app from '../app';
const {expect} = chai;

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const request = chai.request(app).keepOpen();

global.describe('When index route is requested', function() {
    global.it('It should return status 200 and app description', function(done) {
        request.get('/').set('content-type', 'application/json').then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.equal(appConfig.name);
        }).catch((err) => {
            expect(err).to.be.null;
        }).finally(() => {
            done();
        });
    });
});
