# Borderless theme switch and end-of-page controls

The owner requested removal of the hamburger button and the bordered stacked-controls housing. All 106 shared headers now author one native button with switch semantics, sun and crescent/star artwork, a small moving active indicator, saved colour preference and keyboard/focus support. Both symbols remain visible; there is no permanent button border or containing frame. Brand/home panels and section navigation retain their destinations.

The earlier home-page show-after-loading rule made its floating book/Links/mode controls permanent. It has been removed. All pages with floating shortcuts now share the same end-of-page gate: hidden and excluded from keyboard interaction before the last min(420px, 55% viewport height), then entering together with the existing book bar. Scrolling upward withdraws them and closes the Links panel. Layout changes and resizing recalculate the threshold. Reduced motion removes transitions. The book dialog and PDFs, all Links entries and mode destinations remain intact; the static footer remains available throughout the page.

Changes are authored page HTML plus existing CSS/JavaScript owners. No quick-fix stylesheet or content deletion is used. Supersedes the earlier automatic-on-load home dock and central hamburger decisions at the owner's explicit request.
