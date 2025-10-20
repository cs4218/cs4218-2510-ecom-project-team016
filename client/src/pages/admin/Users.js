import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminMenu from "../../components/AdminMenu";
import Layout from "../../components/Layout";
import moment from "moment";

const Users = () => {
  const [users, setUsers] = useState([]);

  // Get all users
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/all-users");
      if (data?.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center">All Users</h1>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{user?.name}</td>
                      <td>{user?.email}</td>
                      <td>{user?.role === 1 ? "Admin" : "User"}</td>
                      <td>{moment(user?.createdAt).fromNow()}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td className="text-center" colSpan="5">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;