const request = require('supertest');
const { app, httpServer } = require('../backend/server.js');
const { expect } = require('chai');

let server;

describe('Servidor Express', () => {
  before((done) => {
    server = httpServer.listen(0, done);
  });

  after((done) => {
    server.close(done);
  });

  it('responde a GET /', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).to.equal(200);
    expect(res.text).to.include('<!DOCTYPE html>');
  });
});
