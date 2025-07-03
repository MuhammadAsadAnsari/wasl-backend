const client = require('../helpers/mongodb');
const { ObjectId } = require('mongodb');
const userService = require('../user/user.service');
var _ = require('lodash');

module.exports = {
    getVisitorCapabilitiesForTeam,
    getVisitorCapabilitiesForRECLeague,
    getVisitorCapabilitiesForLeague,
    getVisitorCapabilitiesForSeason,
    getVisitorCapabilitiesForGame
}

const gameCapabilities = {
    'executive/FREE' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canRequestGameInvite' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        }
    },
    'executive/REC' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canRequestGameInvite' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        }
    },
    'executive/REC_PRO' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : false,
            'game/REC_PRO' : true
        },
        'canRequestGameInvite' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        }
    },
    'executive/PRO' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canRequestGameInvite' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        }
    },
    'player/FREE' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canRequestGameInvite' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        }
    },
    'player/REC' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canRequestGameInvite' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        }
    },
    'player/REC_PRO' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canRequestGameInvite' : {
            'game/PRO' : false,
            'game/REC_PRO' : true
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : false,
            'game/REC_PRO' : true
        }
    },
    'player/PRO' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canRequestGameInvite' : {
            'game/PRO' : true,
            'game/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : true,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : true,
            'game/REC_PRO' : false
        }
    },
    'fan/FREE' : {
        'canGetTickets' : {
            'game/PRO' : true,
            'game/REC_PRO' : true
        },
        'canManageTickets' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canRequestGameInvite' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'game/PRO' : false,
            'game/REC_PRO' : false
        }
    }
};

const seasonCapabilities = {
    'executive/FREE' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        }
    },
    'executive/REC' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        }
    },
    'executive/REC_PRO' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : false,
            'season/REC_PRO' : true
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        }
    },
    'executive/PRO' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        }
    },
    'player/FREE' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        }
    },
    'player/REC' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        }
    },
    'player/REC_PRO' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : false,
            'season/REC_PRO' : true
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : false,
            'season/REC_PRO' : true
        }
    },
    'player/PRO' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : true,
            'season/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : true,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : true,
            'season/REC_PRO' : false
        }
    },
    'fan/FREE' : {
        'canGetTickets' : {
            'season/PRO' : true,
            'season/REC_PRO' : true
        },
        'canManageTickets' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canRequestSeasonInvite' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canSetMinimumBidPrice' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        },
        'canHaveChatWithOwner' : {
            'season/PRO' : false,
            'season/REC_PRO' : false
        }
    }
};

const leagueCapabilities = {
    'executive/FREE' : {
        'canFollow' : {
            'league/REC_PRO' : false,
            'league/PRO' : false
        }
    },
    'executive/REC' : {
        'canFollow' : {
            'league/REC_PRO' : false,
            'league/PRO' : false
        }
    },
    'executive/REC_PRO' : {
        'canFollow' : {
            'league/REC_PRO' : false,
            'league/PRO' : false
        }
    },
    'executive/PRO' : {
        'canFollow' : {
            'league/REC_PRO' : false,
            'league/PRO' : false
        }
    },
    'player/FREE' : {
        'canFollow' : {
            'league/REC_PRO' : false,
            'league/PRO' : false
        }
    },
    'player/REC' : {
        'canFollow' : {
            'league/REC_PRO' : false,
            'league/PRO' : false
        }
    },
    'player/REC_PRO' : {
        'canFollow' : {
            'league/REC_PRO' : true,
            'league/PRO' : false
        }
    },
    'player/PRO' : {
        'canFollow' : {
            'league/REC_PRO' : false,
            'league/PRO' : true
        }
    },
    'fan/FREE' : {
        'canFollow' : {
            'league/REC_PRO' : true,
            'league/PRO' : true
        }
    }
};

const RECLeagueCapabilities = {
    'executive/FREE' : {
        'canFollow' : false,
        'canJoin' : false
    },
    'executive/REC' : {
        'canFollow' : false,
        'canJoin' : false
    },
    'executive/REC_PRO' : {
        'canFollow' : false,
        'canJoin' : false
    },
    'executive/PRO' : {
        'canFollow' : false,
        'canJoin' : false
    },
    'player/FREE' : {
        'canFollow' : false,
        'canJoin' : false
    },
    'player/REC' : {
        'canFollow' : false,
        'canJoin' : true
    },
    'player/REC_PRO' : {
        'canFollow' : false,
        'canJoin' : false
    },
    'player/PRO' : {
        'canFollow' : false,
        'canJoin' : false
    },
    'fan/FREE' : {
        'canFollow' : true,
        'canJoin' : false
    }
}

const teamCapabilities = {
    'executive/FREE' : {
        'canFollow' : false,
        'canRequestTeamInvite' : false,
        'canSendPlayGameInvite' : false,
        'canSendPlaySeasonInvite' : false,
        'canHaveChatWithOwner' : false
    },
    'executive/REC' : {
        'canFollow' : false,
        'canRequestTeamInvite' : false,
        'canSendPlayGameInvite' : false,
        'canSendPlaySeasonInvite' : false,
        'canHaveChatWithOwner' : false
    },
    'executive/REC_PRO' : {
        'canFollow' : false,
        'canRequestTeamInvite' : false,
        'canSendPlayGameInvite' : true,
        'canSendPlaySeasonInvite' : true,
        'canHaveChatWithOwner' : true
    },
    'executive/PRO' : {
        'canFollow' : false,
        'canRequestTeamInvite' : false,
        'canSendPlayGameInvite' : true,
        'canSendPlaySeasonInvite' : true,
        'canHaveChatWithOwner' : true
    },
    'player/FREE' : {
        'canFollow' : false,
        'canRequestTeamInvite' : true,
        'canSendPlayGameInvite' : false,
        'canSendPlaySeasonInvite' : false,
        'canHaveChatWithOwner' : false
    },
    'player/REC' : {
        'canFollow' : false,
        'canRequestTeamInvite' : false,
        'canSendPlayGameInvite' : false,
        'canSendPlaySeasonInvite' : false,
        'canHaveChatWithOwner' : false
    },
    'player/REC_PRO' : {
        'canFollow' : true,
        'canRequestTeamInvite' : true,
        'canSendPlayGameInvite' : false,
        'canSendPlaySeasonInvite' : false,
        'canHaveChatWithOwner' : true
    },
    'player/PRO' : {
        'canFollow' : true,
        'canRequestTeamInvite' : true,
        'canSendPlayGameInvite' : false,
        'canSendPlaySeasonInvite' : false,
        'canHaveChatWithOwner' : true
    },
    'fan/FREE' : {
        'canFollow' : true,
        'canRequestTeamInvite' : false,
        'canSendPlayGameInvite' : false,
        'canSendPlaySeasonInvite' : false,
        'canHaveChatWithOwner' : false
    }
};

async function getVisitorCapabilitiesForTeam(visitor) {

    let visitorCapabilities = {
        'canFollow' : false,
        'canRequestTeamInvite' : false,
        'canSendPlayGameInvite' : false,
        'canSendPlaySeasonInvite' : false,
        'canHaveChatWithOwner' : false
    };

    try {       

        let visitorPlan = `${visitor.profile_type}/${visitor.plan._id}`;        

        if (!visitor.hasOwnProperty('error')) {

            _.forIn(visitorCapabilities, function (value, key) {            
                try {
                    visitorCapabilities[key] = teamCapabilities[visitorPlan][key];
                }
                catch(ex) {
                    console.log(err);
                }
            });
        }

        console.log(visitorCapabilities);
    }
    catch(err) {
        console.log(err);        
    }

    return visitorCapabilities;
}

async function getVisitorCapabilitiesForRECLeague(visitor) {
    
    let visitorCapabilities = {
        canFollow : false,
        canJoin : false
    };

    try {       

        let visitorPlan = `${visitor.profile_type}/${visitor.plan._id}`;        

        if (!visitor.hasOwnProperty('error')) {

            _.forIn(visitorCapabilities, function (value, key) {            
                try {
                    visitorCapabilities[key] = RECLeagueCapabilities[visitorPlan][key];
                }
                catch(ex) {
                    console.log(err);
                }
            });
        }

        console.log(visitorCapabilities);
    }
    catch(err) {
        console.log(err);        
    }

    return visitorCapabilities;
}

async function getVisitorCapabilitiesForLeague(visitor, league) {
    
    let visitorCapabilities = {
        canFollow : false        
    };

    try {       

        let visitorPlan = `${visitor.profile_type}/${visitor.plan._id}`;        
        let leagueType = `league/${league.type}`;

        if (!visitor.hasOwnProperty('error')) {

            _.forIn(visitorCapabilities, function (value, key) {            
                try {
                    visitorCapabilities[key] = leagueCapabilities[visitorPlan][key][leagueType];
                }
                catch(ex) {
                    console.log(err);
                }
            });
        }

        console.log(visitorCapabilities);
    }
    catch(err) {
        console.log(err);        
    }

    return visitorCapabilities;
}

async function getVisitorCapabilitiesForSeason(visitor, season) {
    
    let visitorCapabilities = {
        canGetTickets : false,
        canManageTickets : false,
        canRequestSeasonInvite : false,
        canSetMinimumBidPrice : false,
        canHaveChatWithOwner : false
    };

    try {       

        let visitorPlan = `${visitor.profile_type}/${visitor.plan._id}`;        
        let seasonType = `season/${season.league.type}`;

        if (!visitor.hasOwnProperty('error')) {

            _.forIn(visitorCapabilities, function (value, key) {            
                try {
                    visitorCapabilities[key] = seasonCapabilities[visitorPlan][key][seasonType];
                }
                catch(ex) {
                    console.log(err);
                }
            });

            if (visitor._id.toHexString() === season.league.created_by) {
                visitorCapabilities.canManageTickets = true;
            }
        }

        console.log(visitorCapabilities);
    }
    catch(err) {
        console.log(err);        
    }

    return visitorCapabilities;
}

async function getVisitorCapabilitiesForGame(visitor, game) {
    
    let visitorCapabilities = {
        canGetTickets : false,
        canManageTickets : false,
        canRequestGameInvite : false,
        canSetMinimumBidPrice : false,
        canHaveChatWithOwner : false
    };

    try {       

        let visitorPlan = `${visitor.profile_type}/${visitor.plan._id}`;        
        let gameType = `game/${game.type}`;

        if (!visitor.hasOwnProperty('error')) {

            _.forIn(visitorCapabilities, function (value, key) {            
                try {
                    visitorCapabilities[key] = gameCapabilities[visitorPlan][key][gameType];
                }
                catch(ex) {
                    console.log(err);
                }
            });

            if (visitor._id.toHexString() === game.created_by.profile_id) {
                visitorCapabilities.canManageTickets = true;
            }
        }

        console.log(visitorCapabilities);
    }
    catch(err) {
        console.log(err);        
    }

    return visitorCapabilities;
}