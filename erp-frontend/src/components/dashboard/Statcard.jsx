const StatCard = (props) => {
  return (
    <div className="stat-card">
      <h4>{props.title}</h4>

      <h2>{props.value}</h2>

      <p>{props.description}</p>
    </div>
  );
};

export default StatCard;