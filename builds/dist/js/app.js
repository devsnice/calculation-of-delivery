(function(){
	// Модуль для работы
	var delivery = function(isFrom, isTo, isWeight, isCities, isSubmit) {
		this.elemFrom = isFrom;
		this.elemCities	 = isCities;
		this.elemTo   = isTo;
		this.isWeight = isWeight;
		this.submit = isSubmit;
		
		// "Класс" для работы с отображением данных
		this.View = function View() {
			var View = function View() {

			}
			
			// Метод для отображения доступных городов
			// @param {array} cities - массив объектов, в которых находятся {name, value} 
			View.prototype.inCities = function (cities) {
				for(var i = 0, length = cities.length; i < length; i++) {
					option = "<option data-code="+ cities[i].value +">"+ cities[i].name +"</option>";
					
					$(this.elemFrom).append(option);
					$(this.elemTo).append(option);
				}
			}
			
			// Метод для отображения возможных вариантов
			// @param {intager} maxWeight - максимальный возможных вес посылки
			View.prototype.inWeight = function(maxWeight) {
				var currentWeight = 0;
				
				while(currentWeight < maxWeight) {
					currentWeight += 0.5;
					$(this.isWeight).append("<option data-weight="+ currentWeight +">"+ (currentWeight - 0.5) + " - " +currentWeight +"</option>");
				}
			}
			
			// Метод для отображения результата
			// @param {Object} data - объект, с результатами выполнения запроса {price, term{min,max}}
			View.prototype.inResult = function(data) {
				$("#js-result-cost").append(data.price);
				
				if(data.term.min != data.term.max) {
					$("#js-result-time").append(data.term.min + "-" + data.term.max);	
				}
				else {
					$("#js-result-time").append(data.term.min);
				}
				
				$(".delivery__form").hide();
				$(".delivery__result").fadeIn();
			}
			
			// Метод для отображения возникших ошибок
			// @param {string} error - текст ошибки, которая выведится на экран
			View.prototype.inError = function(error) {
				$(".delivery__error").append(error).show();
			}
			
			return new View();
		}
		
		// Метод для получения информации о доступности сервера
		// @param {Function} callSuccess - функция, которая выполнится, если сервер вернет "ok"
		// @param {Function} callSuccess - функция, которая выполнится, если сервер вернет отрицательльный результат
		//                                                              или возникнут проблемы с соединением
		this.getStatus = function(callSuccess, callError) {
			$.ajax({
				type: "get",
				dataType: "jsonp",
				url: "http://emspost.ru/api/rest/",
				data : {
					method: "ems.test.echo"
				},
				success: function(msg) {
					if(msg.rsp.stat === "ok") {
						callSuccess();
					}
					else {
						callError("Проблемы с сервером EMS");
					}
				},
				error: function(msg) {
					callError("Проблемы с соединением");	
				}
			});
		}
		
		// Метод для получения списка доступых городов
		// @param {Function} callback - функция, которая работает с полученными данными после выполнения запроса
		this.getCities = function(callback) {
			$.ajax({
				type: "get",
				dataType: "jsonp",
				url: "http://emspost.ru/api/rest/",
				data : {
					method: "ems.get.locations",
					type: "cities"
				},
				success: function(msg) {
					callback(msg.rsp.locations);
				}
			});
		}
		
		// Метод для получения результат с сервера
		this.getPrice = function getPrice() {
			var isFrom = $("#js-from").find(':selected').data('code');
			var isTo   = $("#js-to").find(':selected').data('code');
			var isWeight = $("#js-weight").find(':selected').data('weight');
			
			var view = new View(),
				callback = view.inResult;
							
			$.ajax({
				type: "get",
				dataType: "jsonp",
				url: "http://emspost.ru/api/rest/",
				data : {
					method: "ems.calculate",
					from: isFrom,
					to: isTo,
					weight: isWeight
				},
				success: function(msg) {
					callback(msg.rsp);
				}
			});
		}
		
		// Метод для получения максимально доступного веса посылки
		this.getWeight = function(callback) {
			$.ajax({
				type: "get",
				dataType: "jsonp",
				url: "http://emspost.ru/api/rest/",
				data : {
					method: "ems.get.max.weight",
				},
				success: function(msg) {
					callback(msg.rsp.max_weight);
				}
			});
		}
		
		// Метод для инициализации формы
		this.renderForm = function() {
			var view = new View();
			
			this.getCities(view.inCities);
			this.getWeight(view.inWeight);
			
			$(".delivery__form").show();
		}
		
		// Метод для добавления обработчиков
		this.addHandlers = function addHandlers() {
			$(this.submit).click(this.getPrice);
		}
		
		// Инициализация модуля
		this.init = function() {
			var view = new View();
			
			// Установка обработчиков
			this.addHandlers();

			// Инициализация модуля
			this.getStatus(this.renderForm, view.inError);
		}
		
		this.init();
	}
	
	var 
		isFrom = "#js-from",
		isTo   = "#js-to",
		isWeight = "#js-weight",
		isCities = ".js-select-city",
		isSubmit = "#js-get";
		
	delivery(isFrom, isTo, isWeight, isCities, isSubmit);
}());
