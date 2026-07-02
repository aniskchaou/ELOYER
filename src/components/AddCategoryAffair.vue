<template>
 <div class="box-body">
                        <div class="form-group">
                            <div class="row">
                                <div class="col-md-4">
                                    <label for="name" style="clear:both;"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Nom de catégorie </font></font></label>
				                                    <input type="text" name="name" value="" class="form-control">
                                </div>
                            </div>
                        </div>
						
						
			   			
                        <div class="form-group">
                              <div class="row">
                                <div class="col-md-4">
                                    <label for="email" style="clear:both;"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Catégorie Parentale</font></font></label>
									<select name="parent_id" class="form-control chzn" style="display: none;">
										<option value="">--Select Parent Category---</option>
																			</select><div class="chosen-container chosen-container-single" style="width: 456px;" title=""><a class="chosen-single" tabindex="-1"><span><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">--Sélectionnez la catégorie parent ---</font></font></span><div><b></b></div></a><div class="chosen-drop"><div class="chosen-search"><input type="text" autocomplete="off"></div><ul class="chosen-results"></ul></div></div>
                                </div>
                            </div>
                        </div>
						
						
                    </div>
</template>

<script>
export default {
  name: "AddCategoryAffair",
  props: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
