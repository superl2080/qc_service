

module.exports = {

  getList: async function (req, res, next) {
    console.log(__filename + '\n[CALL] getList, query:');
    console.log(req.query);
    try {
      const partner = await this.models.dbs.partner.getById({ partnerId: req.query.token });
      if (!partner) {
        return res.status(401).send({
          code: 0,
          data: result,
        });
      }

      let dataSource = await this.models.dbs.point.getList({ partnerId: partner._id });
      if (partner.info.children) partner.info.children.map( p => dataSource.join(await this.models.dbs.point.getList({ partnerId: p._id })) );

      const params = req.query;

      if (params.sorter) {
        const s = params.sorter.split('_');
        dataSource = dataSource.sort((prev, next) => {
          if (s[1] === 'descend') {
            return next[s[0]] - prev[s[0]];
          }
          return prev[s[0]] - next[s[0]];
        });
      }

      if (params.text) {
        dataSource = dataSource.filter(data => {
          return data.name.indexOf(params.text) >= 0
            || ( data.info.shop && data.info.shop.indexOf(params.text) >= 0 )
            || ( data.partner && data.partner.name.indexOf(params.text) >= 0 );
        });
      }

      if (params.state) {
        dataSource = dataSource.filter(data => data.state === params.state );
      }

      let pageSize = 10;
      if (params.pageSize) {
        pageSize = params.pageSize * 1;
      }

      const result = {
        list: dataSource,
        pagination: {
          total: dataSource.length,
          pageSize,
          current: parseInt(params.currentPage, 10) || 1,
        },
      };

      console.log(result);
      return res.send({
        code: 0,
        data: result,
      });
      
    } catch(err) {
      console.error(__filename + '[CALL] getList, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      return res.send({
        code: 22001,
        data: {
          list: [],
          pagination: {},
        },
        message: err.message,
      });
    }
  },

};

