

module.exports = {

  getList: async function (req, res, next) {
    console.log(__filename + '\n[CALL] getList, query:');
    console.log(req.query);
    try {
      const params = req.query;

      let dataSource = await this.models.dbs.point.getList();

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
            || data.info.shop.indexOf(params.text) >= 0
            || data.partner.name.indexOf(params.text) >= 0;
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

      return res.send({
        code: 22001,
        data: result,
      });
      
    } catch(err) {
      console.error(__filename + '[CALL] getList, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      return res.send({
        code: 22001,
        message: err.message,
      });
    }
  },

};

