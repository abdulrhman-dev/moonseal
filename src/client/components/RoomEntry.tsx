import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../features/store";
import { setUsername } from "../features/RoomSlice";
import { emitCreateRoom, emitJoinRoom } from "../features/socket/SocketFactory";
import styles from "../css/room-entry.module.css";

interface RoomEntryProps {
  onCreateRoom?: () => void;
  onJoinRoom?: () => void;
}

export default function RoomEntry({
  onCreateRoom,
  onJoinRoom,
}: RoomEntryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [username, setUsernameLocal] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [savedUsername, setSavedUsername] = useState("");
  const [mode, setMode] = useState<
    "enter-username" | "room-select" | "join-room"
  >("enter-username");

  useEffect(() => {
    const stored = localStorage.getItem("moonseal-username");
    if (stored) {
      setSavedUsername(stored);
      setUsernameLocal(stored);
      dispatch(setUsername(stored));
      setMode("room-select");
    }
  }, [dispatch]);

  const handleSaveUsername = () => {
    if (username.trim()) {
      localStorage.setItem("moonseal-username", username);
      dispatch(setUsername(username));
      setSavedUsername(username);
      setMode("room-select");
    }
  };

  const handleCreateRoom = () => {
    emitCreateRoom(username);
    onCreateRoom?.();
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      emitJoinRoom(roomCode.toUpperCase(), username);
      onJoinRoom?.();
    }
  };

  const handleChangeUsername = () => {
    setMode("enter-username");
  };

  if (mode === "enter-username") {
    return (
      <div className={styles.container} dir="rtl">
        <div className={styles.card}>
          <h1>أدخل اسم المستخدم</h1>
          <input
            type="text"
            placeholder="اكتب اسم المستخدم..."
            value={username}
            onChange={(e) => setUsernameLocal(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSaveUsername();
              }
            }}
            className={styles.input}
            maxLength={20}
          />
          <button onClick={handleSaveUsername} className={styles.button}>
            متابعة
          </button>
        </div>
      </div>
    );
  }

  if (mode === "room-select") {
    return (
      <div className={styles.container} dir="rtl">
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Moonseal</h1>
            <p className={styles.username}>
              أنت تلعب باسم: <strong>{savedUsername}</strong>
            </p>
            <button
              onClick={handleChangeUsername}
              className={`${styles.button} ${styles.secondary}`}
            >
              تغيير اسم المستخدم
            </button>
          </div>

          <div className={styles.options}>
            <button onClick={handleCreateRoom} className={styles.largeButton}>
              <div className={styles.buttonContent}>
                <h2>إنشاء غرفة</h2>
                <p>أنشئ غرفة جديدة وانتظر لاعبًا آخر</p>
              </div>
            </button>

            <button
              onClick={() => setMode("join-room")}
              className={styles.largeButton}
            >
              <div className={styles.buttonContent}>
                <h2>الانضمام إلى غرفة</h2>
                <p>انضم إلى غرفة موجودة باستخدام رمز</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "join-room") {
    return (
      <div className={styles.container} dir="rtl">
        <div className={styles.card}>
          <h1>الانضمام إلى غرفة</h1>
          <p className={styles.subtitle}>أدخل رمز الغرفة</p>
          <input
            type="text"
            placeholder="اكتب رمز الغرفة..."
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleJoinRoom();
              }
            }}
            className={styles.input}
            maxLength={6}
          />
          <div className={styles.buttonGroup}>
            <button onClick={handleJoinRoom} className={styles.button}>
              انضمام
            </button>
            <button
              onClick={() => setMode("room-select")}
              className={`${styles.button} ${styles.secondary}`}
            >
              رجوع
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
