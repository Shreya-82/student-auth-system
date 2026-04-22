import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [student, setStudent] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: ""
  });
  const [course, setCourse] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudent(res.data);
      setCourse(res.data.course);
    } catch (error) {
      alert("Unauthorized");
      navigate("/login");
    }
  };

  const handlePasswordChange = e => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const updatePassword = async e => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/update-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const updateCourse = async e => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/update-course`,
        { course },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert(res.data.message);
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!student) return <h3 className="text-center mt-5">Loading...</h3>;

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>
      <p><strong>Name:</strong> {student.name}</p>
      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Course:</strong> {student.course}</p>

      <hr />

      <h4>Update Password</h4>
      <form onSubmit={updatePassword}>
        <input className="form-control my-2" type="password" name="oldPassword" placeholder="Old Password" onChange={handlePasswordChange} required />
        <input className="form-control my-2" type="password" name="newPassword" placeholder="New Password" onChange={handlePasswordChange} required />
        <button className="btn btn-warning">Update Password</button>
      </form>

      <hr />

      <h4>Change Course</h4>
      <form onSubmit={updateCourse}>
        <input className="form-control my-2" type="text" value={course} onChange={e => setCourse(e.target.value)} required />
        <button className="btn btn-info">Update Course</button>
      </form>

      <hr />

      <button className="btn btn-danger" onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;