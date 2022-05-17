"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Spot.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      address: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
        validate: {
          len: [4, 30],
        },
      },
      city: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [4, 30],
        },
      },
      state: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [4, 30],
        },
      },
      country: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [4, 30],
        },
      },
      lat: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      lng: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [4, 30],
        },
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      price: {
        allowNull: false,
        type: DataTypes.DECIMAL,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      modelName: "Spot",
    }
  );
  return Spot;
};
