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
                title: "Donation History",
                url: "/dashboard/donor/history",
                isActive: false,
                
            },
        ] as MenuItem[],
        profileItems: [
          
            {
                title: "Organizer Registration",
                url: "/dashboard/donor/profile/registration",
                isActive: false,
                
            },
              {
                title: "Profile",
                url: "/dashboard/donor/profile",
                isActive: false,
                
            },
        ] as MenuItem[],
    },
};

export const OrganizerPage = {
    mainPage: {
        items: [
            {
                title: "Dashboard",
                url: "/dashboard/organizer",
                isActive: false,
            },
            {
                title: "My Donations",
                url: "/dashboard/organizer/donations",
                isActive: false,
               
            },
            {
                title: "Received Donations",
                url: "/dashboard/organizer/campaign-donations",
                isActive: false,
               
            },
            {
                title: "Donation History",
                url: "/dashboard/organizer/history",
                isActive: false,
               
            },
            {
                title: "New Campaign",
                url: "/dashboard/organizer/create",
                isActive: false,
              
            },
        
            {
                title: "Profile",
                url: "/dashboard/organizer/profile",
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
                title: "Donation History",
                url: "/dashboard/admin/history",
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
                url: "/dashboard/superadmin",
                isActive: false,
               
            },
            {
                title: "Manage Admins",
                url: "/dashboard/superadmin/manage-admins",
                isActive: false,
                
            },
            {
                title: "Manage Users",
                url: "/dashboard/superadmin/manage-users",
                isActive: false,
                
            },
            {
                title: "Donation History",
                url: "/dashboard/superadmin/history",
                isActive: false,
                
            },
            {   
                title: "Profile",
                url: "/dashboard/superadmin/profile",
                isActive: false,
                
            },
        ] as MenuItem[],
    },
};