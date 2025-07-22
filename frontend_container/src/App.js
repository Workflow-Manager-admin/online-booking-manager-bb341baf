import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

// --- COLOR PALETTE CONSTANTS ---
const COLORS = {
  primary: "#1976d2",
  secondary: "#90caf9",
  accent: "#ff9800",
};

// -- ENVIRONMENT VARIABLES (used for API endpoint, etc.) --
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api"; // Set in .env

// --- CONTEXTS ---
// Context for Auth
const AuthContext = React.createContext();

// PUBLIC_INTERFACE
function useAuth() {
  // Implements basic auth via token in localStorage, simulates session for demo purposes.
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  // Simulate login
  const login = async (username, password) => {
    // Replace with API call for production
    // Here we simulate success for demo
    const fakeToken = "demo-token";
    setToken(fakeToken);
    setUser({ username });
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify({ username }));
    return true;
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return { user, token, login, logout };
}

// -- Layout/Reusable Components --

function TopNavBar({ user, onLoginClick, onLogout }) {
  return (
    <nav
      className="navbar"
      style={{
        background: COLORS.primary,
        color: "#fff",
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontWeight: "bold",
          fontSize: 22,
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: COLORS.accent }}>Booking</span>Manager
      </span>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 24 }}>Hello, {user.username}</span>
            <button className="btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn" onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

// Sidebar for filters
function BookingFilters({
  filters,
  setFilters,
  resetFilters,
  className = "",
  style = {},
}) {
  return (
    <aside
      className={className}
      style={{
        background: COLORS.secondary,
        padding: 20,
        borderRadius: 12,
        width: "264px",
        minWidth: 140,
        maxWidth: 350,
        marginRight: 16,
        ...style,
      }}
    >
      <h3 style={{ marginTop: 0, color: COLORS.primary }}>Filters</h3>
      <div className="form-group">
        <label>From</label>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
        />
      </div>
      <div className="form-group">
        <label>To</label>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
        />
      </div>
      <div className="form-group">
        <label>Status</label>
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
        >
          <option value="">Any</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={resetFilters} className="btn btn-secondary">
          Clear Filters
        </button>
      </div>
    </aside>
  );
}

// BookingForm - create new booking or edit
function BookingForm({ onSubmit, initial = {}, loading }) {
  const [guestName, setGuestName] = useState(initial.guestName || "");
  const [date, setDate] = useState(initial.date || "");
  const [status, setStatus] = useState(initial.status || "pending");
  const [notes, setNotes] = useState(initial.notes || "");

  useEffect(() => {
    setGuestName(initial.guestName || "");
    setDate(initial.date || "");
    setStatus(initial.status || "pending");
    setNotes(initial.notes || "");
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guestName || !date) return;
    onSubmit({ guestName, date, status, notes });
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h3 style={{ color: COLORS.primary, marginTop: 0 }}>Booking Form</h3>
      <div className="form-group">
        <label>Guest Name</label>
        <input
          type="text"
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Guest Name"
        />
      </div>
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes"
        />
      </div>
      <div>
        <button className="btn" disabled={loading} type="submit">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}

// Booking Table
function BookingTable({
  bookings,
  onEdit,
  onDelete,
  user,
  loading,
  searchTerm,
}) {
  // Filtering handled on parent, but can highlight search term here.
  const highlight = (text, term) =>
    !term
      ? text
      : String(text).replace(
          new RegExp(`(${term})`, "gi"),
          (match) => `<mark>${match}</mark>`
        );

  // Show message if no results.
  if (!loading && bookings.length === 0)
    return (
      <div
        style={{
          padding: "24px 12px",
          fontStyle: "italic",
          color: "#888",
        }}
      >
        No bookings found.
      </div>
    );

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="booking-table">
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((row) => (
            <tr key={row.id}>
              <td
                dangerouslySetInnerHTML={{
                  __html: highlight(row.guestName, searchTerm),
                }}
              />
              <td>{row.date}</td>
              <td>
                <span className={`status-chip chip-${row.status}`}>
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
              </td>
              <td>{row.notes}</td>
              <td>
                {user && (
                  <>
                    <button
                      className="btn btn-small"
                      onClick={() => onEdit(row)}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => onDelete(row.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Authentication Dialog
function LoginDialog({ open, onClose, onLogin, error, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (open) {
      setUsername("");
      setPassword("");
    }
  }, [open]);
  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog login-dialog">
        <h3 style={{ marginTop: 0 }}>Login</h3>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="Username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onClose}
            style={{ marginLeft: 16 }}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
        {error && (
          <div className="error-message" style={{ color: "#d32f2f" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// Main App
function App() {
  // THEME
  const [theme] = useState("light"); // Could implement toggle if desired; UI uses light
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  // AUTH CONTEXT
  const auth = useAuth();
  const { user, token } = auth;
  // STATE
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Search/filter state
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // -- API HANDLERS (CRUD)
  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      // Compose filters and search
      let params = [];
      if (filters.from) params.push(`from=${filters.from}`);
      if (filters.to) params.push(`to=${filters.to}`);
      if (filters.status) params.push(`status=${filters.status}`);
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
      const url = `${API_BASE}/bookings?${params.join("&")}`;
      const resp = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error("Could not fetch bookings");
      const json = await resp.json();
      setBookings(json.bookings || []); // expects {bookings: [...]} or similar
    } catch (err) {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, [filters, searchTerm, token]);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [filters, searchTerm, token]);

  // Create booking
  const handleCreateBooking = async (data) => {
    setCreating(true);
    try {
      const resp = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      if (!resp.ok) throw new Error("Failed to create booking");
      setEditingBooking(null);
      fetchBookings();
    } finally {
      setCreating(false);
    }
  };

  // Update booking
  const handleEditBooking = async (data) => {
    setCreating(true);
    try {
      const resp = await fetch(
        `${API_BASE}/bookings/${editingBooking.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        }
      );
      if (!resp.ok) throw new Error("Failed to update booking");
      setEditingBooking(null);
      fetchBookings();
    } finally {
      setCreating(false);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    await fetch(`${API_BASE}/bookings/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    fetchBookings();
  };

  // Auth
  const openLogin = () => setLoginOpen(true);
  const closeLogin = () => setLoginOpen(false);

  const handleLogin = async (username, password) => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const success = await auth.login(username, password);
      if (!success) throw new Error("Invalid credentials");
      closeLogin();
    } catch (e) {
      setLoginError("Invalid credentials"); // or add proper error
    } finally {
      setLoginLoading(false);
    }
  };

  // Filter & search
  const resetFilters = () =>
    setFilters({
      from: "",
      to: "",
      status: "",
    });

  // Panel layout: side panel left, main booking content center
  return (
    <AuthContext.Provider value={auth}>
      <div
        className="app-root"
        style={{
          minHeight: "100vh",
          background: "#fafcff",
          color: "#222",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <TopNavBar
          user={user}
          onLoginClick={openLogin}
          onLogout={auth.logout}
        />
        <div
          className="main-layout"
          style={{
            display: "flex",
            alignItems: "flex-start",
            maxWidth: 1300,
            margin: "40px auto 0 auto",
            gap: 16,
            padding: "0 12px",
            flexWrap: "wrap",
          }}
        >
          <BookingFilters
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            style={{
              boxShadow: "0 0 16px rgba(25,118,210,0.08)",
            }}
          />
          <div
            className="main-content"
            style={{
              flex: 1,
              minWidth: 270,
              background: "#fff",
              borderRadius: 13,
              padding: 24,
              boxShadow: "0 0 16px rgba(25, 118, 210, 0.07)",
              display: "flex",
              flexDirection: "column",
              minHeight: 440,
              maxWidth: 800,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  color: COLORS.primary,
                  letterSpacing: "1px",
                  margin: 0,
                }}
              >
                Bookings
              </h2>
              <input
                type="text"
                value={searchTerm}
                placeholder="Search bookings..."
                style={{
                  padding: "8px 14px",
                  border: `1px solid ${COLORS.secondary}`,
                  borderRadius: 8,
                  outline: "none",
                  width: 170,
                  marginLeft: 14,
                }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {user && (
                <button
                  className="btn"
                  style={{ marginLeft: 16 }}
                  onClick={() => setEditingBooking({})}
                >
                  + New Booking
                </button>
              )}
            </div>
            <BookingTable
              bookings={bookings}
              onEdit={(b) => setEditingBooking(b)}
              onDelete={handleDeleteBooking}
              user={user}
              loading={loadingBookings}
              searchTerm={searchTerm}
            />

            {editingBooking && (
              <div className="modal-backdrop">
                <div className="modal booking-modal">
                  <BookingForm
                    initial={editingBooking}
                    onSubmit={(data) => {
                      if (editingBooking.id) handleEditBooking(data);
                      else handleCreateBooking(data);
                    }}
                    loading={creating}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    style={{ marginTop: 10 }}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <LoginDialog
          open={loginOpen}
          onClose={closeLogin}
          onLogin={handleLogin}
          error={loginError}
          loading={loginLoading}
        />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
