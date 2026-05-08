import Sidebar from './Sidebar.jsx';

const Layout = ({ children }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="lg:ml-60 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;
