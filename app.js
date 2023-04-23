const express = require("express");
const app = express();

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
    console.log("Server running");
  } catch (e) {
    console.log(`DB error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//AP1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM
    cricket_team`;
  const playersDetails = await db.all(getPlayersQuery);
  response.send(
    playersDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.use(express.json());
app.post("/players/", async (request, response) => {
  const playersDetail = request.body;
  const { playerName, jerseyNumber, role } = playersDetail;
  const addQuery = `INSERT INTO CRICKET_TEAM(player_Name,jersey_Number,role) VALUES(
    '${playerName}',
    ${jerseyNumber},
    '${role}'
    );`;
  const dbResponse = await db.run(addQuery);
  const playerId = dbResponse.latestId;
  response.send("Player Added to Team");
});

//API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerByIdQuery = `
    SELECT
    *
    FROM
    CRICKET_TEAM
    WHERE 
    player_id=${playerId};`;
  const getPlayerById = await db.get(getPlayerByIdQuery);
  response.send(convertDbObjectToResponseObject(getPlayerById));
});

//API 4
app.use(express.json());
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetail = request.body;
  const { playerName, jerseyNumber, role } = playerDetail;
  const putPlayerByIdQuery = `
    UPDATE 
    CRICKET_TEAM
    SET 
    player_Name="${playerName}" and
    jersey_Number= ${jerseyNumber} and
    role="${role}"
    WHERE player_id=${playerId}`;
  const putPlayerById = await db.run(putPlayerByIdQuery);
  response.send("Player Details Updated");
});

//API 5

app.delete("/players/:playersId", async (request, response) => {
  const { playersId } = request.params;
  const deleteQuery = `
    DELETE
    FROM
    CRICKET_TEAM
    WHERE
    player_id=${playersId};`;
  const deleteQ = await db.run(deleteQuery);
  response.send("Player Removed");
});
