//solution or practice
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDetailsDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT
      *
    FROM
      player_details;`;
  const playersArray = await database.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      *
    FROM 
      player_details 
    WHERE 
      player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(convertPlayerDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name ='${playerName}'
  WHERE
    player_id = ${playerId};`;

  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
      match_id = ${matchId};`;
  const matchDetails = await database.get(matchDetailsQuery);
  response.send(convertMatchDetailsDbObjectToResponseObject(matchDetails));
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT
      *
    FROM player_match_score 
      NATURAL JOIN match_details
    WHERE
      player_id = ${playerId};`;
  const playerMatches = await database.all(getPlayerMatchesQuery);
  response.send(
    playerMatches.map((eachMatch) =>
      convertMatchDetailsDbObjectToResponseObject(eachMatch)
    )
  );
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
    SELECT
      *
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      match_id = ${matchId};`;
  const playersArray = await database.all(getMatchPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getmatchPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  const playersMatchDetails = await database.get(getmatchPlayersQuery);
  response.send(playersMatchDetails);
});

module.exports = app;

// # OWN CODE ALL TEST CASE PASSED
// const express = require("express");
// const app = express();

// const { open } = require("sqlite");
// const sqlite3 = require("sqlite3");

// const path = require("path");
// const databasePath = path.join(__dirname, "cricketMatchDetails.db");

// app.use(express.json());
// // console.log(databasePath);

// let database = null;
// const initializeDbAndServer = async () => {
//   try {
//     database = await open({
//       filename: databasePath,
//       driver: sqlite3.Database,
//     });
//     app.listen(3000, () => {
//       console.log("Server is running http://localhost:3000");
//     });
//   } catch (error) {
//     console.log(`The Error message : ${error.message}`);
//   }
// };

// initializeDbAndServer();

// const convertPlayerDbResponseToObject = (dbObject) => {
//   return {
//     playerId: dbObject.player_id,
//     playerName: dbObject.player_name,
//   };
// };

// const convertMatchDbResponseToObject = (dbObject) => {
//   return {
//     matchId: dbObject.match_id,
//     match: dbObject.match,
//     year: dbObject.year,
//   };
// };

// //API 1
// app.get("/players/", async (request, response) => {
//   const getPlayerDetailsQuery = `
//     SELECT
//       *
//     FROM
//     player_details;
//     `;
//   const playersArray = await database.all(getPlayerDetailsQuery);
//   console.log(playersArray);
//   response.send(
//     playersArray.map((eachObject) =>
//       convertPlayerDbResponseToObject(eachObject)
//     )
//   );
// });

// //API 2
// app.get("/players/:playerId/", async (request, response) => {
//   const { playerId } = request.params;
//   const getPlayerDetailsQuery = `
//   SELECT  *
//   FROM
//   player_details
//   WHERE player_id =  ${playerId};
//   `;

//   const playerDetails = await database.get(getPlayerDetailsQuery);
//   console.log(playerDetails);
//   response.send({
//     playerId: playerDetails.player_id,
//     playerName: playerDetails.player_name,
//   });
// });

// //API 3
// app.put("/players/:playerId/", async (request, response) => {
//   const { playerId } = request.params;
//   //   console.log(playerId);

//   const { playerName } = request.body;
//   //   console.log(playerName);

//   const updatePlayerDetailsQuery = `
//   UPDATE
//      player_details
//   SET
//      player_name = '${playerName}'
//   WHERE
//      player_id = ${playerId}
//   `;
//   await database.run(updatePlayerDetailsQuery);
//   response.send("Player Details Updated");
// });

// //API 4
// app.get("/matches/:matchId/", async (request, response) => {
//   const { matchId } = request.params;
//   //   console.log(matchId);

//   const getMatchDetailsQuery = `
//   SELECT
//     *
//   FROM
//     match_details
//   WHERE
//     match_id = '${matchId}';
// `;
//   const matchDetailsArray = await database.get(getMatchDetailsQuery);
//   response.send(convertMatchDbResponseToObject(matchDetailsArray));
// });

// //API 5
// app.get("/players/:playerId/matches", async (request, response) => {
//   const { playerId } = request.params;
//   const getPlayerQuery = `
//   SELECT
//      match_details.match_id ,
//      match_details.match,
//      match_details.year
//   FROM
//      match_details INNER JOIN player_match_score ON match_details.match_id = player_match_score.match_id
//   WHERE player_id = '${playerId}';
//   `;
//   const playerMatchDetails = await database.all(getPlayerQuery);
//   //   console.log(playerMatchDetails);
//   response.send(
//     playerMatchDetails.map((eachObject) =>
//       convertMatchDbResponseToObject(eachObject)
//     )
//   );
// });

// //API 6
// app.get("/matches/:matchId/players", async (request, response) => {
//   const { matchId } = request.params;
//   const getPlayerMatchDetailsQuery = `
//   SELECT
//     player_details.player_id,
//     player_details.player_name
//   FROM
//      player_details NATURAL JOIN player_match_score
//   WHERE
//      match_id = '${matchId}';
//      `;
//   const playerMatchDetails = await database.all(getPlayerMatchDetailsQuery);
//   //   console.log(playerMatchDetails);
//   response.send(
//     playerMatchDetails.map((eachObject) =>
//       convertPlayerDbResponseToObject(eachObject)
//     )
//   );
// });

// //API 7
// app.get("/players/:playerId/playerScores", async (request, response) => {
//   const { playerId } = request.params;
//   //   console.log(playerId);
//   const totalPlayerScore = `
//   SELECT
//     player_details.player_id,
//     player_details.player_name,
//     SUM(player_match_score.score),
//     SUM(player_match_score.fours),
//     SUM(player_match_score.sixes)
//   FROM
//     player_match_score INNER JOIN player_details
//     ON player_details.player_id = player_match_score.player_id
//   WHERE
//     player_details.player_id = '${playerId}';`;
//   const playerTotalScores = await database.get(totalPlayerScore);
//   console.log(playerTotalScores);

//   response.send({
//     playerId: playerTotalScores.player_id,
//     playerName: playerTotalScores.player_name,
//     totalScore: playerTotalScores["SUM(player_match_score.score)"],
//     totalFours: playerTotalScores["SUM(player_match_score.fours)"],
//     totalSixes: playerTotalScores["SUM(player_match_score.sixes)"],
//   });
// });

// module.exports = app;
