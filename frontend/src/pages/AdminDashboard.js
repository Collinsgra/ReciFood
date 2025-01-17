import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardOverview from '../components/admin/DashboardOverview';
import UserManagement from '../components/admin/UserManagement';
import RecipeManagement from '../components/admin/RecipeManagement';
import ContentManagement from '../components/admin/ContentManagement';
import AdminProfile from '../components/admin/AdminProfile';
import AdminSidebar from '../components/admin/AdminSidebar';
import styles from './AdminDashboard.module.css';

const AdminDashboard = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <div className={styles.adminDashboard}>
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={styles.content}>
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="recipes" element={<RecipeManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="profile" element={<AdminProfile />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;