module.exports = function (sequelize, DataTypes) {
  var Game = sequelize.define(
    "Game",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      type: { type: DataTypes.STRING, allowNull: false },
      details: { type: DataTypes.TEXT },
      result: { type: DataTypes.TEXT },
      participants: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    },
    {
      underscored: true,
      tableName: "games",
    }
  );

  Game.associate = function (models) {
    Game.belongsTo(models.User);
  };

  return Game;
};
