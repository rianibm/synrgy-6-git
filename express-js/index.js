const express = require("express");
const fs = require("fs");
const path = require("path");

let listUser = require("./data/users.json");

const app = express();

// Add middleware to get the body from the request
app.use(express.json());

app.get("/api/users", (req, res) => {
  const nameQuery = req.query.name;

  // Baca ulang data dari file JSON
  fs.readFile(
    path.join(__dirname, "data", "users.json"),
    "utf-8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        const response = {
          status: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve data",
          data: {
            users: [],
          },
        };
        res.status(500).send(response);
      } else {
        listUser = JSON.parse(data);

        // Gunakan data yang telah dibaca ulang
        const filteredUsers = listUser.filter(
          (user) =>
            user.name &&
            user.name.toLowerCase().includes(nameQuery.toLowerCase())
        );

        const response = {
          status: "OK",
          message: "Success retrieving data",
          data: {
            users: filteredUsers,
          },
        };

        res.send(response);
      }
    }
  );
});

app.get("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const user = listUser.find((user) => user.id === id);

  if (!user) {
    const response = {
      status: "NOT_FOUND",
      message: "Data not found",
      data: {
        user: null,
      },
    };

    res.status(404).send(response);
  } else {
    const response = {
      status: "OK",
      message: "Success retrieving data",
      data: {
        user: user,
      },
    };

    res.status(200).send(response);
  }
});

app.post("/api/users", (req, res) => {
  const payload = req.body;

  if (!payload.name) {
    const response = {
      status: "BAD_REQUEST",
      message: "Name cannot be empty",
      data: {
        created_user: null,
      },
    };

    res.status(400).send(response);
  } else {
    try {
      const newUser = {
        id: listUser.length > 0 ? listUser[listUser.length - 1].id + 1 : 1,
        name: payload.name,
      };

      listUser.push(newUser);

      // Simpan perubahan kembali ke file JSON
      fs.writeFile(
        path.join(__dirname, "data", "users.json"),
        JSON.stringify(listUser, null, 2),
        (err) => {
          if (err) {
            console.error("Error writing JSON file:", err);
            const response = {
              status: "INTERNAL_SERVER_ERROR",
              message: "Failed to create user",
              data: {
                created_user: null,
              },
            };
            res.status(500).send(response);
          } else {
            const response = {
              status: "CREATED",
              message: "User successfully created",
              data: {
                created_user: newUser,
              },
            };
            res.status(201).send(response);
          }
        }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      const response = {
        status: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user",
        data: {
          created_user: null,
        },
      };
      res.status(500).send(response);
    }
  }
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
