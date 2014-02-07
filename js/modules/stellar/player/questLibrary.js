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
		
		generatePtQuest : function(lib, parentQuest) {
			console.log(lib.Quest);
			var nextPtQuest = new lib.Quest({
				id : "ptQuest" + this.ptQuestCounter,
				title: "Gather More Points!"
			});
			
			nextPtQuest.addRequirement({
                pointsGained : parentQuest.requirements.pointsGained*1.5
            });
            
            parentQuest.nextQuests.push(nextPtQuest);
            
            this.ptQuestCounter++;
		},
	});
	
	return QuestLibrary;
});