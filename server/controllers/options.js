
const sequelize = require('../db/sequelize').sequelize;

function getSkewData(req, res) {

	// const projectID = req.params.projectID;
  const projectID = 'NFLX';
	// const schedule = req.body;

  const sql = `
    SELECT 		
			*
		FROM
			skews
		WHERE
		  symbol NOT IN ('DUST', 'GUSH', 'UCO', 'USO', 'VXX', 'SPXU', 'XOP', 'UVXY', 'VIXY', 'TNA', 'SQQQ', 'SH',
			         'SDS', 'SDOW', 'TZA', 'AMLP', 'OVV', 'LYB', 'SPXL', 'UPRO', 'TQQQ', 'SVXY', 'NUGT', 'JNUG', 'NEM', 'SRTY', 'FAZ',
							 'DXD', 'TWM', 'DIA', 'UDOW', 'GDXJ', 'GDXJ')
			AND quad1 > 10 AND quad2 > 10 AND quad3 > 10 AND quad4 > 10 
			AND quad1v2 < -5
			AND (daysToExpiration = 20 OR daysToExpiration = 55)
		ORDER BY
			quad1v2
    `

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
		.then(option => {		
      // console.log(option)
      res.json(option);
		})
}


module.exports = {
  getSkewData: getSkewData
}
