/**
 * Created by Vaibhav Kaushal on 25th May 2023
 */

'use strict';

require('./health');
require('./media');

app.use(process.env.PATH_ALIAS || '/', router);