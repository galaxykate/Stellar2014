/**
 * @author April Grow
 */

define(["common"], function(common) {
	var QuestLibrary = Class.extend({
		init : function(questManager){
			this.QuestManager = questManager
			this.ptQuestCounter = 0;
		},
		
		initQuests : function(){
			/* All quests take the form:
			 * 
			 * 		var blahQuest = new Quest({
			 * 			id : "action0",
		     *           title : "Click more than once",
		     *       });
		     *       
		     *       blahQuest.addRequirement({
		     *       	useControl : ["click", "click", "click"],
		     *       });
		     *       
		     *  And optionally
		     *       blahQuest.activate(player);
			 * 
			 *  Or alternatively
			 * 		blahQuest.nextQuests.push(blahQuest2);
			 * 
			 */
			
			
		},
		
		generatePtQuest : function(player, manager, parentQuest) {
			console.log(manager);
			
			var nextPtQuest = manager.makeQuestObj({
				id : "ptQuest" + this.ptQuestCounter,
				title: "Gather More Points!",
				
				onStart : {
                    popupText : "This is a procedurally-generated quest!  Get some points!"
                },
                onEnd : {
                    reward : {
                        points : 200,
                    },
                    popupText : "Well done, have some more points",
                    execute: function(player, manager, quest){
	                    	manager.questLibrary.generatePtQuest(player, manager, quest); 
                    }
                }
			});
			//console.log(parentQuest.requirements[0].requirements); //.requirements is a list of TRIGGERS
			
			//console.log("Points?: " + parentQuest.requirements[0].requirements.pointsGained);
			nextPtQuest.addRequirement({
                pointsGained : parentQuest.requirements[0].requirements.pointsGained*1.5
            });
            
            if(parentQuest.nextQuests === undefined) parentQuest.nextQuests = [];
            parentQuest.nextQuests.push(nextPtQuest);
            
            this.ptQuestCounter++;
		},
	});
	
	return QuestLibrary;
});