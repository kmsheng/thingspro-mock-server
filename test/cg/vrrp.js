import test from 'ava';
import createMockServer from '../../index.js';
import {get, put} from './_helpers';

test.before(async t => {

  const {app, server} = await createMockServer({
    rootFolderPath: 'schema/cg/',
    port: 8000,
    host: '0.0.0.0',
    filename: 'vrrp.yaml'
  });

  t.context.server = server;

  t.context.get = get.bind(null, app);

  t.context.put = put.bind(null, app);
});

test.cb('GET /network/vrrp', t => {

  t.context.get('/network/vrrp')
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        throw err;
      }
      // result: { enable: false, status: false }
      t.snapshot(res.body);
      t.end();
    });
});

test.after(t => t.context.server.close());
