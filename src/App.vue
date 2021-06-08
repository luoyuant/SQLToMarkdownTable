<template>
	<div>
		<textarea v-model="inputSql" class="sql_input" placeholder="请输入SQL语句" />
		<input class="create_header_checkbox" type="checkbox" v-model="isCreateMdTableHeader" />生成表头
		<textarea v-model="outputMdText" class="sql_output" />
	</div>
</template>

<script>
	export default {
		name: 'App',
		data() {
			return {
				inputSql: "",
				outputMdText: "", //输出框内容 
				mdTableHeaderText: "| 字段 | 类型 | 是否为空 | 默认值 | 说明 |\r| :--: | :--: | :--: | :--: | :--: |\r", //表头内容 
				mdTableContentText: "", //表内容
				isCreateMdTableHeader: true, //是否生成表头
			}
		},
		watch: {
			inputSql: function(newVal, oldVal) {
				this.handleSql(newVal);
			},
			isCreateMdTableHeader: function(newVal, oldVal) {
				this.outputMdText = newVal ? (this.mdTableHeaderText + this.mdTableContentText) : this.mdTableContentText;
			}
		},
		mounted() {

		},
		methods: {
			handleSql: function(sql) {
				var list = sql.split("\t");
				list = list.map(this.handleSqlItemLevelOne);
				this.getSQLProperties(list);
				console.log(list)
			},
			handleSqlItemLevelOne: function(sqlItem, index) {
				var resList = sqlItem.split("] ");
				resList = resList.map(this.handleSqlItemLevelTwo);
				if (resList.length == 2) {
					var type = resList.pop();
					if (type.indexOf("(") != -1 && type.indexOf(")") != -1) {
						type = type.trimRight();
						type = type.trimRight(",");
						var rList = type.split(" ");
						resList = resList.concat(rList);
					}
				}
				return resList;
			},
			handleSqlItemLevelTwo: function(sqlItem, index) {
				var res = sqlItem;
				switch (index) {
					case 0:
						res = res.replace("[", "");
						break;
					case 1:
						res = res.replace("[", "");
						res = res.replace("]", "");
						break;
					case 2:
						res = res.trimRight();
						res = res.trimRight(",");
						break;
				}
				return res;
			},
			getSQLProperties: function(list) {
				var propertiesList = [];
				for (var index in list) {
					var itemList = list[index];
					if (itemList.length && itemList.length >= 3) {
						var itemObj = new Object();
						for (var i in itemList) {
							var item = itemList[i];
							
							//i是字符串
							switch (Number(i)) {
								case 0:
									itemObj["name"] = item;
									break;
								case 1:
									itemObj["type"] = item;
									break;
								case 2:
									itemObj["isNull"] = item.indexOf("NOT NULL") == -1;
									itemObj["desc"] = item.indexOf("IDENTITY(1,1)") != -1 ? "[自增]" : "";
									break;
							}
						}
						
						propertiesList.push(itemObj);
					}
				}
				this.getMdText(propertiesList);
			},
			getMdText: function(pList) {
				var mdTextList = [];
				for (var index in pList) {
					var p = pList[index];
					var name = "| " + p.name + " ";
					var type = "| " + p.type + " ";
					var isNull = "| " + (p.isNull ? "是" : "否") + " ";
					var defaultValue = "|  ";
					var desc = "| " + p.desc + " |";
					
					var mdText = name + type + isNull + defaultValue + desc;
					mdTextList.push(mdText);
				}
				this.mdTableContentText = mdTextList.join("\r");
				this.outputMdText = this.isCreateMdTableHeader ? (this.mdTableHeaderText + this.mdTableContentText) : this.mdTableContentText;
				console.log(mdTextList)
			}
			
		}
	}
</script>

<style>
	#app {
		/* font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50; */
		margin-top: 60px;
	}

	.sql_input {
		width: calc(100% - 16px);
		height: 250px;
	}
	
	.create_header_checkbox {
		margin-top: 30px;
		font-size: 12px;
	}

	.sql_output {
		margin-top: 30px;
		width: calc(100% - 16px);
		height: 250px;
	}
</style>
