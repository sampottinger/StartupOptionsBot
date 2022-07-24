<!DOCTYPE html>
<meta charset="utf-8">
<title>Income Gaps Tests</title>
<link rel="stylesheet" href="./qunit-2.19.0.css">
<link rel="stylesheet" href="../incomegaps.css">
<body>
  <div id="qunit"></div>
  <div id="qunit-fixture"></div>

  <article>
    <div id="vizBody">
      <table id="vizTable">
        <thead>
          <tr>
            <th class="cell-occupation">Name</th>
            <th class="cell-value" id="valueLabel">Pay</th>
            <th class="cell-gap" id="gapLabel">Gap</th>
            <th class="cell-gini">Gini</th>
          </tr>
        </thead>
        <tbody id="vizTableBody">
        </tbody>
      </table>
    </div>

    <input type="text" id="variable" value="income.median">
    <input type="text" id="dimension" value="educ">
    <input id="groupSizeCheck" type="checkbox" checked>
    <input id="colorblindModeCheck" type="checkbox" checked>
    <input id="zoomingAxisCheck" type="checkbox" checked>
    <input id="metricsCheck" type="checkbox" checked>
    <input id="requireMinCheck" type="checkbox" class="min-size-check" checked>
    <div id="filtersCountLabel"></div>
    <div id="noDataMessage">
      No matching data.
    </div>
    <div id="filtersPanel">
      <div id="lateLoadingIndicator"></div>
      <div class="filter">
        <div class="filter-title">Gender</div>
        <div><label for="femaleCheck"><input id="femaleCheck" filtervalue="Female" type="checkbox" class="gender-check filter-check" checked> Female</label></div>
        <div><label for="maleCheck"><input id="maleCheck" filtervalue="Male" type="checkbox" class="gender-check filter-check" checked> Male</label></div>
      </div>
      <div class="filter">
        <div class="filter-title">Race and ethnicity</div>
        <div><label for="asianCheck"><input id="asianCheck" filtervalue="Asian" type="checkbox" class="race-check filter-check" checked> Asian</label></div>
        <div><label for="blackCheck"><input id="blackCheck" filtervalue="Black" type="checkbox" class="race-check filter-check" checked> Black</label></div>
        <div><label for="hispanicCheck"><input id="hispanicCheck" filtervalue="Hispanic" type="checkbox" class="race-check filter-check" checked> Hispanic</label></div>
        <div><label for="multipleRaceCheck"><input id="multipleRaceCheck" filtervalue="Multiple races" type="checkbox" class="race-check filter-check" checked> Multiple races</label></div>
        <div><label for="nativeCheck"><input id="nativeCheck" filtervalue="Native American" type="checkbox" class="race-check filter-check" checked> Native American</label></div>
        <div><label for="whiteCheck"><input id="whiteCheck" filtervalue="White" type="checkbox" class="race-check filter-check" checked> White</label></div>
      </div>
      <div class="filter">
        <div class="filter-title">Education</div>
        <div><label for="advancedCheck"><input id="advancedCheck" filtervalue="Advanced" type="checkbox" class="education-check filter-check" checked> Advanced</label></div>
        <div><label for="collegeCheck"><input id="collegeCheck" filtervalue="College" type="checkbox" class="education-check filter-check" checked> College</label></div>
        <div><label for="someCheck"><input id="someCheck" filtervalue="Some college" type="checkbox" class="education-check filter-check" checked> Some college</label></div>
        <div><label for="highSchoolCheck"><input id="highSchoolCheck" filtervalue="High school" type="checkbox" class="education-check filter-check" checked> High school</label></div>
        <div><label for="lessHighSchoolCheck"><input id="lessHighSchoolCheck" filtervalue="Less than high school" type="checkbox" class="education-check filter-check" checked> Less than high school</label></div>
      </div>
      <div class="filter">
        <div class="filter-title">Census region</div>
        <div><label for="midwestCheck"><input id="midwestCheck" filtervalue="Midwest" type="checkbox" class="region-check filter-check" checked> Midwest</label></div>
        <div><label for="northeastCheck"><input id="northeastCheck" filtervalue="Northeast" type="checkbox" class="region-check filter-check" checked> Northeast</label></div>
        <div><label for="southCheck"><input id="southCheck" filtervalue="South" type="checkbox" class="region-check filter-check" checked> South</label></div>
        <div><label for="westCheck"><input id="westCheck" filtervalue="West" type="checkbox" class="region-check filter-check" checked> West</label></div>
      </div>
      <div class="filter">
        <div class="filter-title">Citizenship</div>
        <div><label for="naturalizedCheck"><input id="naturalizedCheck" filtervalue="Foreign born, naturalized US citizen" type="checkbox" class="citizenship-check filter-check" checked> Foreign born, naturalized US citizen</label></div>
        <div><label for="notCheck"><input id="notCheck" filtervalue="Foreign born, not a US citizen" type="checkbox" class="citizenship-check filter-check" checked> Foreign born, not a US citizen</label></div>
        <div><label for="abroadParentsCheck"><input id="abroadParentsCheck" filtervalue="Native, born abroad with American parent(s)" type="checkbox" class="citizenship-check filter-check" checked> Native, born abroad with American parent(s)</label></div>
        <div><label for="islandsCheck"><input id="islandsCheck" filtervalue="Native, born in Puerto Rico or other US island areas" type="checkbox" class="citizenship-check filter-check" checked> Native, born in Puerto Rico or other US island areas</label></div>
        <div><label for="nativeCheck"><input id="nativeCheck" filtervalue="Native, born in US" type="checkbox" class="citizenship-check filter-check" checked> Native, born in US</label></div>
      </div>
      <div class="filter">
        <div class="filter-title">Age</div>
        <div><label for="ageLt25Check"><input id="ageLt25Check" filtervalue="<25 yr" type="checkbox" class="age-check filter-check" checked> <25 yr</label></div>
        <div><label for="age25Check"><input id="age25Check" filtervalue="25-35 yr" type="checkbox" class="age-check filter-check" checked> 25-35 yr</label></div>
        <div><label for="age35Check"><input id="age35Check" filtervalue="35-45 yr" type="checkbox" class="age-check filter-check" checked> 35-45 yr</label></div>
        <div><label for="age45Check"><input id="age45Check" filtervalue="45-55 yr" type="checkbox" class="age-check filter-check" checked> 45-55 yr</label></div>
        <div><label for="age55Check"><input id="age55Check" filtervalue="55-65 yr" type="checkbox" class="age-check filter-check" checked> 55-65 yr</label></div>
        <div><label for="ageGt65Check"><input id="ageGt65Check" filtervalue="65+ yr" type="checkbox" class="age-check filter-check" checked> 65+ yr</label></div>
      </div>
      <div class="filter">
        <div class="filter-title">Usual hours worked weekly</div>
        <div><label for="lessThan35HoursCheck"><input id="lessThan35HoursCheck" filtervalue="Less than 35 Hours" type="checkbox" class="hours-check filter-check" checked> Less than 35 hours</label></div>
        <div><label for="atLeast35HoursCheck"><input id="atLeast35HoursCheck" filtervalue="At Least 35 Hours" type="checkbox" class="hours-check filter-check" checked> At least 35 hours</label></div>
        <div><label for="otherHoursCheck"><input id="otherHoursCheck" filtervalue="Varies or Other" type="checkbox" class="hours-check filter-check" checked> Hours vary or other</label></div>
      </div>
      <div class="filter last">
        <div class="filter-title">Small samples</div>
        <div><label for="requireMinCheck"><input id="requireMinCheck" type="checkbox" class="min-size-check"> Include groups < 0.02% of people.</label></div>
      </div>
    </div>
  </article>

  <script src="./qunit-2.19.0.js"></script>

  <script src="../dependencies/papaparse.min.js"></script>
  <script src="../dependencies/d3.min.js"></script>

  <script src="../const.js"></script>
  <script src="../data.js"></script>
  <script src="../deeplink.js"></script>
  <script src="../glpyhs.js"></script>
  <script src="../intro.js"></script>
  <script src="../presenter.js"></script>

  <script src="../driver.js"></script>

  <script src="./tests.js"></script>
</body>