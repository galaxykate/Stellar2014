/**
 * @author Kate Compton
 */

define(["common", "./questLibrary"], function(common, QuestLibrary) {

    // What makes a quest chain?
    //

    var QuestManager = Class.extend({
        init : function() {
            this.activeQuests = [];
            this.completedQuests = [];
            this.questLibrary = new QuestLibrary(this);
            this.Quest = Quest;
        },

        addActive : function(quest) {
            this.activeQuests.push(quest);
        },

        applyToActiveQuestsRequirements : function(fxn) {
            for (var i = 0; i < this.activeQuests.length; i++) {
                var quest = this.activeQuests[i];

                for (var j = 0; j < quest.requirements.length; j++) {
                    fxn.call(this, quest.requirements[j]);
                }
            }
        },

        update : function(worldTime) {

        },

        cleanup : function() {
            var qm = this;
            this.activeQuests = this.activeQuests.filter(function(quest) {
                if (quest.isCompleted) {
                    qm.completedQuests.push(quest);
                    console.log("  Cleanup complete quest:" + quest);
                    return false;
                }
                return true;
            });

            app.log(this.activeQuests.length + " quests active!");
            app.log(this.completedQuests.length + " quests complete!");
        },
    });

    // id, title
    // nextQuests: quests to activate from this one
    // rewards: {points, elementBag, objects, achievement, unlock}

    var Quest = Class.extend({
        init : function(settings) {
            _.extend(this, settings);
            this.requirements = [];
            console.log("Create quest: " + this);
            this.isCompleted = false;
        },

        activate : function(player) {
            this.player = player;
            console.log("Activate: " + this + " " + this.player);

            if (player === undefined) {
                console.log(this);
                throw ("Undefined player");
            }

            player.questManager.addActive(this);
			
			if(this.onStart){
				this.onStartEvents(this.onStart);
			}
        },
        
        onStartEvents : function(start){
        	console.log("Working on onStartEvents for quest " + this.id);
        	
        	// TO DO: Something with popup texts
        },

        addTextChain : function() {
            // Make some fake next quests
            var pts = Math.floor(Math.random() * 600)
            var next = new Quest({
                id : "points" + pts,
                title : "Get " + pts + " more points",
                onStart : {
                    popupText : "Keep workin'"
                },
                onEnd : {
                    reward : {
                        points : 100,
                    },
                    popupText : "Well done, have some more points"
                }
            });

            next.addRequirement({
                pointsGained : pts,
            });

            this.nextQuests.push(next);
        },

        addRequirement : function(requirementSet) {
            var quest = this;

            var trigger = new Trigger({
                requirements : requirementSet,
                onSuccess : function() {
                    console.log(this + " succeeded!");
                    quest.complete();
                },
            });

            this.requirements.push(trigger);

        },
        complete : function() {
            var quest = this;
            // Call any complete handlers
            //applyToHandlers("complete", [this]);

            // remove this from active quests
            console.log("Completed " + this);
            
            // Checking onEnd must come before nextQuests
            // To generate next quests, I put them in "onEnd"
            if(this.onEnd){
				this.onEndEvents(this.onEnd);
			}

            if (this.nextQuests) {
                console.log("..start " + this.nextQuests + " new quests");
                $.each(this.nextQuests, function(index, next) {
                    next.activate(quest.player);
                });
            }
            this.isCompleted = true;
            
            app.addToNewsFeed({
                html : app.makeSpanColor("green", "Quest Completed! ") + this.title,
                timeout : 2500,
            });
        },
        
        onEndEvents : function(end){
        	console.log("Working on onEndEvents for quest " + this.id);
        	console.log(end);
        	// TO DO: Something with popup texts
        	// TO DO: Something with rewards
        	
        	//if(end.execute) end.execute(this.player.questManager.questLibrary, this);
        },
        
        toString : function() {
            return this.title + utilities.inSquareBrackets(this.requirements);
        }
    });

    var Trigger = Class.extend({
        init : function(settings) {
            _.extend(this, settings);
            this.satisfied = {};

            var reqs = this.requirements;
            if (reqs.pointsGained) {
                this.startPoints = app.player.points;
            }

            this.description = "";
            for (var property in settings.requirements) {
                if (settings.requirements.hasOwnProperty(property)) {
                    this.satisfied[property] = false;
                    if (this.description.length > 0)
                        this.description += ", ";
                    this.description += property + ": " + settings.requirements[property];
                }
            }
            console.log(this.description);
        },

        onGetPoints : function(points) {
            var reqs = this.requirements;

            if (reqs.pointsGained) {
                var gained = app.player.points - this.startPoints;
                console.log("onGetPoints: Player has gained " + gained + " points since quest start");
                if (gained > reqs.pointsGained) {
                	console.log("REQUIREMENTS MET. Check?");
                    this.satisfied.pointsGained = true;
                    this.check();
                }
            }
        },
        
        onUseAction : function(ctrlName, options){
        	var reqs = this.requirements;
        	
        	if(reqs.useControl){
        		console.log("Quest detected that needs a control used");
        		console.log(reqs.useControl);
        		
        		var foundAt = -1;
        		for(var i = 0; i < reqs.useControl.length; i++){
        			if(ctrlName === reqs.useControl[i]){
        				foundAt = i;
        				console.log("Required action for quest found at quest requirements index " + i);
        				break;
        			}
        		}
        		
        		if(foundAt !== -1){
        			console.log("This WAS a control that was needed for the quest!!!");
        			reqs.useControl.splice(foundAt, 1);
        		} else{
        			console.log("This was not a control that was needed for the quest");
        			
        		}
        		
        		if(reqs.useControl.length === 0){
        			console.log("REQUIREMENTS MET. Check?");
                    this.satisfied.useControl = true;
                    this.check();
        		}
        	}
        },

        check : function() {
            var satisfied = true;
            var reqs = this.requirements;
            console.log("Is " + this + " finished?");
            for (var property in reqs) {
                if (reqs.hasOwnProperty(property)) {
                    if (!this.satisfied[property]) {
                        console.log("  " + property + " not satisfied!");
                        satisfied = false;
                    }
                }
            }
            if (satisfied) {
            	console.log("QUEST IS FULLY COMPLETED! Calling onSuccess()");
                if (this.onSuccess)
                    this.onSuccess();
            }

        },

        toString : function() {
            return this.description;
        }
    });

    Quest.Trigger = Trigger;

    Quest.QuestManager = QuestManager;
    return Quest;
});
