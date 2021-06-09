<template>
	<div>
		<textarea v-model="inputSql" class="sql_input" placeholder="请输入SQL语句" />
		<input class="create_header_checkbox" type="checkbox" v-model="isCreateMdTableHeader" />生成表头
		<input class="create_header_checkbox" type="checkbox" v-model="isCreateMdTableOthers" />生成其他信息
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
				mdTableInfoText: "数据表说明：...\r\r", //数据表说明
				mdTableHeaderText: "| 字段 | 类型 | 是否为空 | 默认值 | 说明 |\r| :--: | :--: | :--: | :--: | :--: |\r", //表头内容 
				mdTableContentText: "", //表内容
				mdTableUpdateLogText: "\r\r数据表更新日志\r\r| 修改内容 | 修改时间 | 修订人 |\r| :--: | :--: | :--: |\r| 修改了xxx | 2021-6-8 | 张三 |", //数据表更新日志
				isCreateMdTableHeader: true, //是否生成表头
				isCreateMdTableOthers: true, //是否生成其他信息
				
				primaryKey: "", //主键
				defaultValueList: [], //默认值
				descList: [], //字段说明
			}
		},
		watch: {
			inputSql: function(newVal, oldVal) {
				this.clearContent();
				this.handleSql(newVal);
			},
			isCreateMdTableHeader: function(newVal, oldVal) {
				this.getResultOutputText();
			},
			isCreateMdTableOthers: function(newVal, oldVal) {
				this.getResultOutputText();
			}
		},
		mounted() {

		},
		methods: {
			/**
			 * 清空内容
			 */
			clearContent: function() {
				this.outputMdText = "";
				this.mdTableContentText = "";
				this.primaryKey = "";
				this.defaultValueList = [];
				this.descList = [];
			},
			handleSql: function(sql) {
				var list = sql.split("GO");
				list = list.map((item) => {
					var res = item.trimLeft("\n");
					res = res.trimRight("\n");
					return res;
				});
				
				//获取默认值Sql
				var defaultValueSqlList = list.filter(function(item) {
					return item.indexOf("ALTER TABLE") != -1 && item.indexOf("ADD  CONSTRAINT") != -1 && item.indexOf("DEFAULT") != -1;
				});
				this.handleSqlPropertiesDefaultValue(defaultValueSqlList);
				
				//获取字段说明Sql
				var descSqlList = list.filter(function(item) {
					return item.indexOf("EXEC sys.sp_addextendedproperty") != -1 && item.indexOf("MS_Description") != -1;
				});
				this.handleSqlPropertiesDesc(descSqlList);
				
				//获取创建表字段Sql
				var createTableSqlList = list.filter(function(item) {
					return item.indexOf("CREATE TABLE") != -1;
				});
				
				if (!createTableSqlList || !createTableSqlList.length) {
					return;
				}
				
				var createTableSql = createTableSqlList[0];
				//获取表名
				var createTableNameSqlRegex = /CREATE TABLE \[dbo\]\.\[.*\]/
				var createTableNameSql = createTableSql.match(createTableNameSqlRegex)
				if (!createTableNameSql || !createTableNameSql.length) {
					return;
				}
				createTableNameSql = createTableNameSql[0];
				var createTableNameSqlList = createTableNameSql.split("[dbo].");
				var tableName = createTableNameSqlList[1];
				tableName = tableName.replace("[", "");
				tableName = tableName.replace("]", "");
				
				//获取字段Sql语句
				var propertiesSql = "";
				if (createTableSql.indexOf("CONSTRAINT") == -1) {
					var createTableList = createTableSql.split(") ON");
					propertiesSql = createTableList[0];
					createTableList = propertiesSql.split(tableName + "](")
					propertiesSql = createTableList[1];
				} else {
					var createTableList = createTableSql.split("CONSTRAINT");
					propertiesSql = createTableList[0];
					var constraintSql = createTableList[1];
					
					createTableList = propertiesSql.split(tableName + "](")
					propertiesSql = createTableList[1];
					
					//获取主键
					if (constraintSql.indexOf("PRIMARY KEY") != -1) {
						var primaryKeyList = constraintSql.match(/\(\n\t.*\n\)/);
						if (primaryKeyList && primaryKeyList.length) {
							var primaryKeyText = primaryKeyList[0];
							primaryKeyText = primaryKeyText.split("[")[1];
							primaryKeyText = primaryKeyText.split("]")[0];
							this.primaryKey = primaryKeyText;
						}
						
					}
				}
				
				this.handleSqlProperties(propertiesSql);

			},
			
			/**
			 * 处理默认值
			 */
			handleSqlPropertiesDefaultValue: function(list) {
				if (!list || !list.length) {
					return;
				}
				var resultList = [];
				for (var index in list) {
					var item = list[index];
					var nameList = item.match(/FOR \[.*\]/);
					var name = nameList.length ? nameList[0] : null;
					if (name) {
						name = name.split(" ")[1];
						name = name.replace("[", "");
						name = name.replace("]", "");
					}
					
					var defaultValueList = item.match(/DEFAULT \(.*\)/);
					var defaultValue = defaultValueList.length ? defaultValueList[0] : "";
					if (defaultValue) {
						defaultValue = defaultValue.split(" ")[1];
						while (defaultValue.indexOf("(") != -1) {
							defaultValue = defaultValue.replace("(", "");
						}
						while (defaultValue.indexOf(")") != -1) {
							defaultValue = defaultValue.replace(")", "");
						}
					}
					if (name) {
						var obj = {};
						obj.name = name;
						obj.defaultValue = defaultValue;
						resultList.push(obj);
					}
				}
				this.defaultValueList = resultList;
			},
			
			/**
			 * 处理字段说明
			 */
			handleSqlPropertiesDesc: function(list) {
				if (!list || !list.length) {
					return;
				}
				var resultList = [];
				for (var index in list) {
					var item = list[index];
					var nameList = item.match(/@level2name\=[^@]*'/);
					var name = nameList.length ? nameList[0] : null;
					if (name) {
						nameList = name.split("'")
						if (nameList.length >= 3) {
							name = nameList[1];
						} else {
							name = "";
						}
					}
					var descList = item.match(/@value=[^@]*\'/);
					var desc = descList.length ? descList[0] : null;
					if (desc) {
						descList = desc.split("'");
						if (descList.length >= 3) {
							desc = descList[1];
						} else {
							desc = "";
						}
					}
					if (name) {
						var obj = {};
						obj.name = name;
						obj.desc = desc;
						resultList.push(obj);
					}
				}
				this.descList = resultList;
			},
			
			/**
			 * 处理表字段
			 */
			handleSqlProperties: function(sql) {
				var list = sql.split("\t");
				list = list.map(this.handleSqlPropertiesItemLevelOne);
				this.getSQLProperties(list);

			},
			/**
			 * 处理表字段：步骤一
			 */
			handleSqlPropertiesItemLevelOne: function(sqlItem, index) {
				var resList = sqlItem.split("] ");
				resList = resList.map(this.handleSqlPropertiesItemLevelTwo);
				if (resList.length == 2) {
					var type = resList.pop();
					if (type.indexOf("(") != -1 && type.indexOf(")") != -1) {
						type = type.trimRight();
						type = type.trimRight(",");
						var rList = type.split(") ");
						rList = rList.map((item) => {
							var resText = item;
							if (resText.indexOf("(") != -1) {
								resText = resText + ")";
							}
							return resText;
						});
						resList = resList.concat(rList);
					}
				}
				return resList;
			},
			/**
			 * 处理表字段：步骤二
			 */
			handleSqlPropertiesItemLevelTwo: function(sqlItem, index) {
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
			/**
			 * 获取表各个字符属性
			 */
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
						
						itemObj.defaultValue = "";
						
						//默认值
						if (this.defaultValueList.length > 0) {
							var dList = this.defaultValueList.filter(function(dObj) {
								return dObj.name == itemObj.name;
							});
							if (dList.length) {
								itemObj.defaultValue = dList[0].defaultValue;
							}
						}
						
						//说明
						if (this.descList.length > 0) {
							var dList = this.descList.filter(function(dObj) {
								return dObj.name == itemObj.name;
							});
							if (dList.length) {
								itemObj.desc = dList[0].desc + itemObj.desc;
							}
						}
						
						propertiesList.push(itemObj);
					}
				}
				this.getMdText(propertiesList);
			},
			/**
			 * 生成Markdown表内容
			 */
			getMdText: function(pList) {
				var mdTextList = [];
				for (var index in pList) {
					var p = pList[index];
					var name = "| " + p.name + " ";
					var type = "| " + p.type + " ";
					var isNull = "| " + (p.isNull ? "是" : "否") + " ";
					var defaultValue = "| " + p.defaultValue + " ";
					var desc = "| " + p.desc + " |";
					
					var mdText = name + type + isNull + defaultValue + desc;
					mdTextList.push(mdText);
				}
				this.mdTableContentText = mdTextList.join("\r");
				
				this.getResultOutputText();
				
			},
			/**
			 * 获取输出内容
			 */
			getResultOutputText: function() {
				var tableText = this.isCreateMdTableHeader ? (this.mdTableHeaderText + this.mdTableContentText) : this.mdTableContentText;
				var resText = this.isCreateMdTableOthers ? (this.mdTableInfoText + tableText + this.mdTableUpdateLogText) : tableText;
				this.outputMdText = resText;
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
