jQuery(function ($) {
	"use strict"; // start of use strict

	/*==============================
	Menu
	==============================*/
	$('.header__btn__new').on('click', function () {
		var headerMenuClass = $('.header__menu').attr('class');
	//alert("menu clicked before "+headerMenuClass);
		//$(this).toggleClass('header__btn--active');
		if($('.header__menu').hasClass('header__menu--active'))
			$('.header__menu').removeClass('header__menu--active')
		else
			$('.header__menu').addClass('header__menu--active')
		
		
		//$('.header__menu').toggleClass('header__menu--active');	
		
		var headerMenuClass2 = $('.header__menu').attr('class');
		//alert("menu clicked after "+headerMenuClass2);
	});

	//$('.header__search .close, .header__action--search button').on('click', function () {
	//	$('.header__search').toggleClass('header__search--active');
	//});

	/*==============================
	Multi level dropdowns
	==============================*/
	$('ul.dropdown-menu [data-toggle="dropdown"]').on('click', function (event) {
		event.preventDefault();
		event.stopPropagation();

		$(this).siblings().toggleClass('show');
	});

	$(document).on('click', function (e) {
		$('.dropdown-menu').removeClass('show');
	});

	/*==============================
	Home slider
	==============================*/
	$('.hero').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: true,
		autoplay: false,
		smartSpeed: 600,
		autoHeight: true,
		items: 1,
		responsive: {
			0: {
				margin: 20,
			},
			576: {
				margin: 20,
			},
			768: {
				margin: 30,
			},
			1200: {
				margin: 30,
				mouseDrag: false,
			},
		}
	});

	/*==============================
	Carousel
	==============================*/
	$('.main__carousel--collections').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: false,
		autoplay: false,
		smartSpeed: 600,
		margin: 20,
		autoHeight: true,
		responsive: {
			0: {
				items: 1,
			},
			576: {
				items: 1,
			},
			768: {
				items: 2,
				margin: 30,
			},
			992: {
				items: 3,
				margin: 30,
			},
			1200: {
				items: 4,
				margin: 30,
				mouseDrag: false,
				dots: false,
			},
		}
	});

	$('.main__carousel--live').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: false,
		autoplay: false,
		autoplayHoverPause: true,
		autoplayTimeout: 5000,
		smartSpeed: 600,
		margin: 20,
		merge:true,
		autoHeight: true,
		responsive: {
			0: {
				items: 1,
			},
			576: {
				items: 1,
			},
			768: {
				items: 2,
				margin: 30,
			},
			992: {
				items: 3,
				margin: 30,
			},
			1200: {
				items: 4,
				margin: 30,
				mouseDrag: false,
				dots: false,
			},
		}
	});

	$('.main__carousel--explore').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: false,
		autoplay: false,
		autoplayHoverPause: true,
		autoplayTimeout: 5000,
		smartSpeed: 600,
		margin: 20,
		autoHeight: true,
		responsive: {
			0: {
				items: 1,
			},
			576: {
				items: 1,
			},
			768: {
				items: 2,
				margin: 30,
			},
			992: {
				items: 3,
				margin: 30,
			},
			1200: {
				items: 4,
				margin: 30,
				mouseDrag: false,
				dots: false,
			},
		}
	});


	$('.main__carousel--authors').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: false,
		autoplay: false,
		autoplayHoverPause: true,
		autoplayTimeout: 5000,
		smartSpeed: 600,
		margin: 20,
		autoHeight: true,
		responsive: {
			0: {
				items: 1,
			},
			576: {
				items: 1,
			},
			768: {
				items: 4,
				margin: 30,
			},
			992: {
				items: 4,
				margin: 30,
			},
			1200: {
				items: 4,
				margin: 30,
				mouseDrag: false,
				dots: false,
			},
		}
	});

	$('.card__cover--carousel').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: true,
		autoplay: false,
		autoplayHoverPause: true,
		autoplayTimeout: 5000,
		autoplaySpeed: 800,
		smartSpeed: 800,
		margin: 20,
		items: 1,
	});

	/*==============================
	Navigation
	==============================*/
	$('.main__nav--prev').on('click', function () {
		var carouselId = $(this).attr('data-nav');
		$(carouselId).trigger('prev.owl.carousel');
	});
	$('.main__nav--next').on('click', function () {
		var carouselId = $(this).attr('data-nav');
		$(carouselId).trigger('next.owl.carousel');
	});

	/*==============================
	Partners
	==============================*/
	$('.partners').owlCarousel({
		mouseDrag: false,
		touchDrag: false,
		dots: false,
		loop: true,
		autoplay: false,
		autoplayTimeout: 5000,
		autoplayHoverPause: true,
		smartSpeed: 600,
		margin: 20,
		responsive: {
			0: {
				items: 4,
			},
			576: {
				items: 4,
				margin: 20,
			},
			768: {
				items: 4,
				margin: 30,
			},
			992: {
				items: 4,
				margin: 30,
			},
			1200: {
				items: 4,
				margin: 30,
			},
			1900: {
				items: 4,
				margin: 30,
			},
		}
	});

	/*==============================
	Modal
	==============================*/
	$('.open-video, .open-map').magnificPopup({
		disableOn: 0,
		fixedContentPos: true,
		type: 'iframe',
		preloader: false,
		removalDelay: 300,
		mainClass: 'mfp-fade',
	});

	$('.asset__img').magnificPopup({
		fixedContentPos: true,
		type: 'image',
		closeOnContentClick: true,
		closeBtnInside: false,
		mainClass: 'my-mfp-zoom-in',
		image: {
			verticalFit: true
		},
		zoom: {
			enabled: true,
			duration: 400
		}
	});

	$('.open-modal').magnificPopup({
		fixedContentPos: true,
		fixedBgPos: true,
		overflowY: 'auto',
		type: 'inline',
		preloader: false,
		focus: '#username',
		modal: false,
		removalDelay: 300,
		mainClass: 'my-mfp-zoom-in',
	});

	$('.modal__close').on('click', function (e) {
		e.preventDefault();
		$.magnificPopup.close();
	});

	$('.open-tran-modal').magnificPopup({
		fixedContentPos: true,
		fixedBgPos: true,
		overflowY: 'auto',
		type: 'inline',
		preloader: false,
		focus: '#username',
		modal: false,
		removalDelay: 300,
		mainClass: 'my-mfp-zoom-in',
	});

	/*==============================
	Select
	==============================*/
	$('.main__select').select2({
		minimumResultsForSearch: Infinity
	});

	/*==============================
	Copy
	==============================*/
	$('.author__code button').on('click', function () {
		var copyText = document.getElementById('author-code');
		copyText.select(); /* Select the text field */
		copyText.setSelectionRange(0, 99999); /* For mobile devices */
		document.execCommand("copy"); /* Copy the text inside the text field */

		/* Alert the copied text */
		$(this).addClass('active');
		setTimeout(function () {
			$('.author__code button').removeClass('active');
		}, 1200);
	});

	/*==============================
	Section bg
	==============================*/
	$('.main__video-bg, .author__cover--bg, .main__author, .collection__cover, .hero__slide').each(function () {
		if ($(this).attr('data-bg')) {
			$(this).css({
				'background': 'url(' + $(this).data('bg') + ')',
				'background-position': 'center center',
				'background-repeat': 'no-repeat',
				'background-size': 'cover'
			});
		}
	});

	/*==============================
	Upload file
	==============================*/

	/*==============================
	Countdown
	==============================*/
	$('.asset__clock').countdown('2022/12/01', function (event) {
		$(this).html(event.strftime('%D days %H:%M:%S'));
	});

	$('.card__clock--1').countdown('2022/12/01', function (event) {
		$(this).html(event.strftime('%H:%M:%S'));
	});

	$('.card__clock--2').countdown('2023/11/01', function (event) {
		$(this).html(event.strftime('%H:%M:%S'));
	});

	/*==============================
	Scrollbar
	==============================*/
	var Scrollbar = window.Scrollbar;

	if ($('#asset__actions--scroll').length) {
		Scrollbar.init(document.querySelector('#asset__actions--scroll'), {
			damping: 0.1,
			renderByPixels: true,
			alwaysShowTracks: true,
			continuousScrolling: false,
		});
	}

	/*** Audio Player ****/
	$('.audio-control').click(function(e){
		e.preventDefault();
		$("audio").not(this).each(function(index, audio) {
			audio.pause();
			audio.currentTime = 0;
		});
		$('.audio-control.play').removeClass('d-none');
		$('.audio-control.pause').addClass('d-none');
		if($(this).hasClass('play'))
		{
			document.getElementById($(this).attr('href')).play();
			$(this).addClass('d-none');
			$(this).parent().find('.pause').removeClass('d-none');
		}
		else
		{
			document.getElementById($(this).attr('href')).pause();
			$(this).addClass('d-none');
			$(this).parent().find('.play').removeClass('d-none');
		}
		// else if($(this).hasClass('pause')){
		// 	audo.pause();
		// }
		
	});

	$(document).on('click','.audio-control-btn',function(){
		console.log("clicked");
		$("audio").not(this).each(function(index, audio) {
			audio.pause();
			audio.currentTime = 0;
			audio.load();
		});
		$("video").not(this).each(function(index, video) {
			video.pause();
			video.currentTime = 0;
			video.load();
			$('.video-control-btn.play').removeClass('d-none');
			$('.video-control-btn.pause').addClass('d-none');
		});
		$('.audio-control-btn.play').removeClass('d-none');
		$('.audio-control-btn.pause').addClass('d-none');
		if($(this).hasClass('play'))
		{
			document.getElementById($(this).val()).play();
			$(this).addClass('d-none');
			$(this).parent().find('.pause').removeClass('d-none');
		}
		else
		{
			document.getElementById($(this).val()).pause();
			$(this).addClass('d-none');
			$(this).parent().find('.play').removeClass('d-none');
		}
		// else if($(this).hasClass('pause')){
		// 	audo.pause();
		// }
		
	});

	$(document).on('click','.video-control-btn',function(){
		console.log("clicked");
		$("audio").not(this).each(function(index, audio) {
			audio.pause();
			audio.currentTime = 0;
			audio.load();
			$('.audio-control-btn.play').removeClass('d-none');
			$('.audio-control-btn.pause').addClass('d-none');
		});
		$("video").not(this).each(function(index, video) {
			video.pause();
			video.currentTime = 0;
			video.load();
		});
		$('.video-control-btn.play').removeClass('d-none');
		$('.video-control-btn.pause').addClass('d-none');
		if($(this).hasClass('play'))
		{
			document.getElementById($(this).val()).play();
			$(this).addClass('d-none');
			$(this).parent().find('.pause').removeClass('d-none');
		}
		else
		{
			document.getElementById($(this).val()).pause();
			$(this).addClass('d-none');
			$(this).parent().find('.play').removeClass('d-none');
		}
		
	});

	$(document).on('click','.video-control-btn-singlePage',function(){
		if($(this).hasClass('play'))
		{
			$("#SingleNFTVideo").trigger('play');
			$(this).addClass('d-none');
			$(this).parent().find('.pause').removeClass('d-none');
		}
		else
		{
			$("#SingleNFTVideo").trigger('pause');
			$(this).addClass('d-none');
			$(this).parent().find('.play').removeClass('d-none');
		}
	});
	$(document).on('click','#SingleNFTVideo',function(){
		console.log("Clicked");
		$('#SingleNFTVideo').bind('play', function (e) {
			$('.video-control-btn-singlePage.play').addClass('d-none');
			$('.video-control-btn-singlePage.pause').removeClass('d-none');
		});
		$('#SingleNFTVideo').bind('pause', function (e) {
			$('.video-control-btn-singlePage.play').removeClass('d-none');
			$('.video-control-btn-singlePage.pause').addClass('d-none');
		});

	});
	let video = document.getElementById("SingleNFTVideo");
	video.addEventListener("play", videoPlay);
	function videoPlay() {
		$('.video-control-btn-singlePage.play').addClass('d-none');
		$('.video-control-btn-singlePage.pause').removeClass('d-none');
		console.log('Played');
	}
	//console.log(audio);

});