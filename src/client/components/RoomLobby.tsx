import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "../features/store";
import { resetRoom } from "../features/RoomSlice";
import { emitLeaveRoom, emitStartGame } from "../features/socket/SocketFactory";
import styles from "../css/room-lobby.module.css";

interface RoomLobbyProps {
  onStartGame?: () => void;
  onLeaveRoom: () => void;
}

export default function RoomLobby({
  onStartGame,
  onLeaveRoom,
}: RoomLobbyProps) {
  const dispatch = useDispatch<AppDispatch>();
  const room = useSelector((state: RootState) => state.room);

  const handleLeaveRoom = () => {
    emitLeaveRoom();
    dispatch(resetRoom());
    onLeaveRoom();
  };

  const handleStartGame = () => {
    emitStartGame();
    onStartGame?.();
  };

  return (
    <div className={styles.container} dir="rtl">
      <div className={styles.lobby}>
        <h1>ردهة الغرفة</h1>

        <div className={styles.roomCode}>
          <p className={styles.label}>رمز الغرفة</p>
          <div className={styles.code}>{room.roomCode}</div>
        </div>

        <div className={styles.players}>
          <h2>اللاعبون ({room.players.length}/2)</h2>
          <div className={styles.playerList}>
            {room.players.map((player) => (
              <div key={player.id} className={styles.playerItem}>
                <div className={styles.playerName}>{player.username}</div>
                {player.isLeader && (
                  <span className={styles.leaderBadge}>القائد</span>
                )}
              </div>
            ))}
            {room.players.length < 2 && (
              <div className={styles.playerItem + " " + styles.waiting}>
                <div className={styles.playerName}>بانتظار لاعب...</div>
              </div>
            )}
          </div>
        </div>

        {room.players.length === 2 && room.isLeader && (
          <button onClick={handleStartGame} className={styles.startButton}>
            بدء اللعبة
          </button>
        )}

        {room.players.length < 2 && (
          <div className={styles.waitingMessage}>
            <p>بانتظار انضمام لاعب آخر...</p>
            <p className={styles.shareCode}>
              شارك هذا الرمز: <strong>{room.roomCode}</strong>
            </p>
          </div>
        )}

        <button onClick={handleLeaveRoom} className={styles.leaveButton}>
          مغادرة الغرفة
        </button>
      </div>
    </div>
  );
}
