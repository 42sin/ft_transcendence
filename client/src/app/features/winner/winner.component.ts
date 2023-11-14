import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'projects/tools/src/lib/services/api.service';

@Component({
  selector: 'app-winner',
  templateUrl: './winner.component.html',
  styleUrls: ['./winner.component.css']
})
export class WinnerComponent implements OnInit
{
  	winner: string = ''; // Initialize the property with an empty string

  	constructor(private route: ActivatedRoute, private router: Router, private apiService: ApiService) { }

	ngOnInit()
	{
		this.route.queryParams.subscribe(params =>
		{
			console.log (params);
			if (params['winner'])
			{
				this.winner = params['winner'];
			}
		});
	}
}
