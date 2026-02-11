// Meir Panim Users Configuration
// Password for all users: MeirPanim2025

const USERS_DB = {
    // Level 3: Super Admin - Full access including deletions
    'super-admin': {
        password: 'MeirPanim2025',
        level: 3,
        role: 'Super Admin',
        permissions: {
            viewAll: true,
            delete: true,
            manageUsers: true,
            viewReports: true,
            markDelivered: true
        },
        branch: null, // Can see all branches
        hebrewName: 'מנהל על'
    },

    // Level 2: Main Admin - View all branches, no deletions
    'admin-main': {
        password: 'MeirPanim2025',
        level: 2,
        role: 'Main Admin',
        permissions: {
            viewAll: true,
            delete: false,
            manageUsers: false,
            viewReports: true,
            markDelivered: true
        },
        branch: null, // Can see all branches
        hebrewName: 'אדמין ראשי'
    },

    // Level 1: Branch Managers - View only their branch
    'manager-jerusalem': {
        password: 'MeirPanim2025',
        level: 1,
        role: 'Branch Manager',
        permissions: {
            viewAll: false,
            delete: false,
            manageUsers: false,
            viewReports: true,
            markDelivered: true
        },
        branch: 'ירושלים',
        hebrewName: 'מנהל סניף ירושלים'
    },

    'manager-tzfat': {
        password: 'MeirPanim2025',
        level: 1,
        role: 'Branch Manager',
        permissions: {
            viewAll: false,
            delete: false,
            manageUsers: false,
            viewReports: true,
            markDelivered: true
        },
        branch: 'צפת',
        hebrewName: 'מנהל סניף צפת'
    },

    'manager-dimona': {
        password: 'MeirPanim2025',
        level: 1,
        role: 'Branch Manager',
        permissions: {
            viewAll: false,
            delete: false,
            manageUsers: false,
            viewReports: true,
            markDelivered: true
        },
        branch: 'דימונה',
        hebrewName: 'מנהל סניף דימונה'
    },

    'manager-orakiva': {
        password: 'MeirPanim2025',
        level: 1,
        role: 'Branch Manager',
        permissions: {
            viewAll: false,
            delete: false,
            manageUsers: false,
            viewReports: true,
            markDelivered: true
        },
        branch: 'אור עקיבא',
        hebrewName: 'מנהל סניף אור עקיבא'
    },

    'manager-tiberias': {
        password: 'MeirPanim2025',
        level: 1,
        role: 'Branch Manager',
        permissions: {
            viewAll: false,
            delete: false,
            manageUsers: false,
            viewReports: true,
            markDelivered: true
        },
        branch: 'טבריה',
        hebrewName: 'מנהל סניף טבריה'
    }
};

// Authentication function
function authenticateUser(username, password) {
    const user = USERS_DB[username];
    
    if (!user) {
        return { success: false, message: 'שם משתמש לא נמצא' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'סיסמה שגויה' };
    }
    
    // Create session
    const session = {
        username: username,
        level: user.level,
        role: user.role,
        permissions: user.permissions,
        branch: user.branch,
        hebrewName: user.hebrewName,
        loginTime: new Date().toISOString()
    };
    
    return { success: true, session: session };
}

// Check if user can view a registration
function canViewRegistration(userSession, registrationCity) {
    // Super admin and main admin can view all
    if (userSession.permissions.viewAll) {
        return true;
    }
    
    // Branch managers can only view their branch
    return userSession.branch === registrationCity;
}

// Check if user can delete
function canDelete(userSession) {
    return userSession.permissions.delete === true;
}

// Get user's accessible branches
function getAccessibleBranches(userSession) {
    if (userSession.permissions.viewAll) {
        return ['ירושלים', 'צפת', 'דימונה', 'אור עקיבא', 'טבריה'];
    }
    return [userSession.branch];
}
