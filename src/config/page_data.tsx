export interface MenuItem {
    title: string;
    url: string;
    isActive?: boolean;
}

export const DonorPage = {
    mainPage: {
         items: [
            {
                title: "Dashboard",
                url: "/dashboard/donor",
                isActive: false,
            
            },
            {
                title: "Riwayat Donasi",
                url: "/dashboard/donor/history",
                isActive: false,
                
            },
        ] as MenuItem[],
        profileItems: [
            {
                title: "Profile",
                url: "/dashboard/donor/profile",
                isActive: false,
                
            },
            {
                title: "Registrasi Inisiator Donasi",
                url: "/dashboard/donor/profile/registration",
                isActive: false,
                
            },
        ] as MenuItem[],
    },
};

export const DoneePage = {
    mainPage: {
        items: [
            {
                title: "Donasi Dibuka",
                url: "/dashboard/donee/donations",
                isActive: false,
               
            },
            {
                title: "Buka Donasi Baru",
                url: "/dashboard/donee/donations/create",
                isActive: false,
              
            },
            {
                title: "Modifikasi Donasi",
                url: "/dashboard/donee/edit-donation",
                isActive: false,
               
            },
            {
                title: "Profile",
                url: "/dashboard/donee/profile",
                isActive: false,
                
            },
        ] as MenuItem[],
    },
};

export const AdminPage = {
    mainPage: {
        items: [
            {
                title: "Dashboard",
                url: "/dashboard/admin",
                isActive: false,
               
            },
            {
                title: "Manage Donations",
                url: "/dashboard/admin/manage-donations",
                isActive: false,
                
            },
            {
                title: "Manage Users",
                url: "/dashboard/admin/manage-users",
                isActive: false,
               
            },
            {
                title: "Manage Applications",
                url: "/dashboard/admin/manage-application",
                isActive: false,
                
            },
            {
                title: "Profile",
                url: "/dashboard/admin/profile",
                isActive: false,
               
            },
        ] as MenuItem[],
    },
};

export const SuperAdminPage = {
    mainPage: {
        items: [
            {
                title: "Dashboard",
                url: "/dashboard/super-admin",
                isActive: false,
               
            },
            {
                title: "Manage Users",
                url: "/dashboard/super-admin/manage-users",
                isActive: false,
                
            },
            {
                title: "Profile",
                url: "/dashboard/super-admin/profile",
                isActive: false,
                
            },
        ] as MenuItem[],
    },
};